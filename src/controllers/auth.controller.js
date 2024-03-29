const bcrypt = require("bcryptjs");
const config = require("../config");
const jwt = require("jsonwebtoken");
const id6 = require("../helpers/id6");
const mongoose = require("mongoose");
const { TIPO_PLANO_ASSINATURA } = require("../schemas/enums");

const UsuarioSchema = require("../schemas/usuario.schema");
const PFSchema = require("../schemas/pf.schema");
const PJSchema = require("../schemas/pj.schema");
const { sendEmail, EMAIL_TYPES } = require("./sendEmail");
const {
  showPlanoAssinatura,
  showDefaultPlanoAssinatura,
  listPlanosAssinatura,
} = require("./plano-assinatura.controller");
const {
  getSubscriptionInGateway,
  getCustomerFromGateway,
  getSubscriptionInvoicesInGateway,
  getSubscriptionPaymentInGateway,
} = require("./assinatura.gateway.controller");

const UsuarioModel = mongoose.model("Usuario", UsuarioSchema);
const PFModel = mongoose.model("PF", PFSchema);
const PJModel = mongoose.model("PJ", PJSchema);

const encryptPassword = async (password) => {
  const hash = await bcrypt.hash(password, 7);
  return hash;
};

const comparePassword = async (a, b) => {
  const isHashEqual = await bcrypt.compare(a, b);
  return isHashEqual;
};

const getAuthResponse = (usuarioObj, withToken = true) => {
  const objPlano = {
    _id: usuarioObj.plano?._id || usuarioObj.plano,
    nome: usuarioObj.plano?.nome,
    tipo: usuarioObj.plano?.tipo,
    modosDePagamento: usuarioObj.plano?.modosDePagamento,
    features: (usuarioObj.plano?.features || []).reduce(
      (all, feat) => ({
        ...all,
        [feat.chave]: feat.valor,
      }),
      {}
    ),
  };

  const data = {
    _id: usuarioObj._id,
    email: usuarioObj.email,
    gateway_id: usuarioObj.gateway_id,
    subscription_id: usuarioObj.subscription_id,
    plano: objPlano,
    planoExpirado: usuarioObj.planoExpirado,
    subscriptionStatus: usuarioObj.subscriptionStatus,
  };
  if (withToken) {
    data.token = jwt.sign(data, config.jwtSecret, {
      expiresIn: 2629800, // 3hrs in sec
    });
  }
  return data;
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  if (!senha) throw new Error("Senha não informada");
  if (!email) throw new Error("Email não informado");

  const usuarioObj = await UsuarioModel.findOne({ email }).lean();
  if (!usuarioObj) throw new Error("Usuario não encontrado");

  const isSenhaOk = await comparePassword(senha, usuarioObj.senha);
  if (!isSenhaOk) throw new Error("Senha inválida");

  const objPlanAss = await showPlanoAssinatura(usuarioObj.plano);
  if (objPlanAss) {
    usuarioObj.plano = objPlanAss;
  } else {
    throw new Error("Plano de Assinatura inválido");
  }
  
  usuarioObj.subscriptionStatus = "?";

  if (usuarioObj.subscription_id) {
    const subscription = await getSubscriptionInGateway(
      usuarioObj.subscription_id
    );
    console.log('subscription :>> ', subscription);

    usuarioObj.subscriptionStatus = subscription?.status;

    if (subscription && subscription?.status !== "ACTIVE") {
      const defaultPlan = await showDefaultPlanoAssinatura(objPlanAss.tipo);
      usuarioObj.plano = defaultPlan;
      usuarioObj.planoExpirado = true;
    }
  }

  return getAuthResponse(usuarioObj);
};

exports.register = async (req, res) => {
  const { email, senha, isEmpresa } = req.body;
  if (!senha) throw new Error("Senha não informada");
  const hashSenha = await encryptPassword(senha);
  const data = {
    _id: id6(),
    email,
    senha: hashSenha,
  };

  let objPlanAss;
  if (isEmpresa) {
    objPlanAss = await showDefaultPlanoAssinatura(TIPO_PLANO_ASSINATURA.PJ);
    if (!objPlanAss) {
      throw new Error(
        "Nenhum plano de assinatura Padrão para Empresas cadastrado"
      );
    }
    data.plano = objPlanAss._id;
  } else {
    objPlanAss = await showDefaultPlanoAssinatura(TIPO_PLANO_ASSINATURA.PF);
    if (!objPlanAss) {
      throw new Error(
        "Nenhum plano de assinatura Padrão para Candidatos cadastrado"
      );
    }
    data.plano = objPlanAss._id;
  }

  const usuarioObj = await UsuarioModel.create(data);
  if (!usuarioObj) throw new Error("Erro ao criar usuário");

  await sendEmail({ email, name: email, type: EMAIL_TYPES.NEW_SIGNUP });

  return getAuthResponse({ ...data, plano: objPlanAss });
};

exports.updatePlano = async (req, res) => {
  const { id, plano } = req.body;

  const objPlanAss = await showPlanoAssinatura(plano);
  if (!objPlanAss) {
    throw new Error(`Plano inválido "${plano}"`);
  }

  const usuarioObj = await UsuarioModel.findByIdAndUpdate(
    id,
    { plano },
    { new: true, runValidators: true }
  );
  if (!usuarioObj)
    throw new Error("Erro ao atualizar o plano de assinatura do usuário");

  return getAuthResponse(usuarioObj);
};

exports.elevate = async (req, res) => {
  const id = req.usuario?._id;
  if (!id) throw new Error("Usuário não encontrado na sessão");

  const masterpass = req.params.masterpass;
  if (masterpass !== "tryevo_master_password")
    throw new Error("Senha mestre errada");

  const objPlanAssMA = await showDefaultPlanoAssinatura(
    TIPO_PLANO_ASSINATURA.MA
  );
  if (objPlanAssMA) {
    throw new Error("Plano de Assinatura padrão para Admin não encontrado");
  }

  const usuarioObj = await UsuarioModel.findByIdAndUpdate(
    id,
    { plano: objPlanAssMA._id },
    { new: true, runValidators: true }
  );
  if (!usuarioObj) throw new Error("Erro ao elevar usuário");

  return "Elevado com sucesso!";
};

exports.changeAccountType = async (req, res) => {
  const id = req.usuario?._id;
  if (!id) throw new Error("Usuário não encontrado na sessão");

  const tipo = req.body.tipo.toUpperCase();

  let plano = null;
  if (tipo === "PF" || tipo === "PJ") {
    const objPlanAss = await showDefaultPlanoAssinatura(tipo);
    if (!objPlanAss) {
      throw new Error(
        `Plano de Assinatura padrão para "${tipo}" não encontrado`
      );
    }
    plano = objPlanAss._id;
  } else {
    throw new Error(`Tipo inválido "${tipo}" ao alterar conta`);
  }

  const usuarioObj = await UsuarioModel.findByIdAndUpdate(
    id,
    { plano },
    { new: true, runValidators: true }
  );
  if (!usuarioObj) throw new Error("Erro ao atualizar tipo de conta");

  return getAuthResponse(usuarioObj);
};

exports.getSelf = async (req, res) => {
  if (!req.usuario?._id) throw new Error("Usuário não encontrado na sessão");
  const usuario = await UsuarioModel.findById(req.usuario._id);
  if (!usuario) throw new Error("Usuario não encontrado");
  const data = {
    _id: usuario._id,
    email: usuario.email,
    gateway_id: usuario.gateway_id,
    subscription_id: usuario.subscription_id,
    plano: usuario.plano,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt,
  };

  data.subscriptionStatus = "?";

  const objPlanAss = await showPlanoAssinatura(usuario.plano);
  if (objPlanAss) {
    data.plano = objPlanAss;
  }
  
  if (usuario.subscription_id) {
    const subscription = await getSubscriptionInGateway(
      usuario.subscription_id
    );
    console.log('subscription :>> ', subscription);

    data.subscriptionStatus = subscription?.status;

    if (subscription && subscription?.status !== "ACTIVE") {
      const defaultPlan = await showDefaultPlanoAssinatura(objPlanAss.tipo);
      data.plano = defaultPlan;
      data.planoExpirado = true;
    }
  }

  const withToken = !!req.query?.withToken

  return getAuthResponse(data, withToken);
};

exports.deleteSelf = async (req, res) => {
  if (!req.usuario?._id) throw new Error("Usuário não encontrado na sessão");
  const usuario = await UsuarioModel.findByIdAndRemove(req.usuario._id);
  if (!usuario) throw new Error("Usuario não encontrado");
  return {
    usuario: usuario._doc,
    deleted: true,
  };
};

exports.changePassword = async (req, res) => {
  const { senha } = req.body;
  if (!senha) throw new Error("Senha não informada");
  const id = req.usuario?._id;
  if (!id) throw new Error("Usuário não encontrado na sessão");
  const usuario = await UsuarioModel.findById(id);
  if (!usuario) throw new Error("Usuario não encontrado");

  const hashSenha = await encryptPassword(senha);
  const usuarioObj = await UsuarioModel.findByIdAndUpdate(
    id,
    { senha: hashSenha },
    { new: true, runValidators: true }
  );
  if (!usuarioObj) throw new Error("Erro ao alterar senha");

  await sendEmail({
    email: usuario.email,
    name: usuario.email,
    type: EMAIL_TYPES.PASSWORD_CHANGED,
  });

  return getAuthResponse(usuarioObj);
};

exports.changeUserPassword = async (req, res) => {
  const { id, senha } = req.body;
  if (!senha) throw new Error("Senha não informada");
  const usuario = await UsuarioModel.findById(id);
  if (!usuario) throw new Error("Usuario não encontrado");

  const hashSenha = await encryptPassword(senha);
  const usuarioObj = await UsuarioModel.findByIdAndUpdate(
    id,
    { senha: hashSenha },
    { new: true, runValidators: true }
  );
  if (!usuarioObj) throw new Error("Erro ao alterar senha do usuário");

  await sendEmail({
    email: usuario.email,
    name: usuario.email,
    type: EMAIL_TYPES.PASSWORD_CHANGED,
  });

  return getAuthResponse(usuarioObj);
};

exports.getSingleUser = async (req, res) => {
  const data = await UsuarioModel.findById(req.params.id);

  const objPlanAss = await showPlanoAssinatura(data?.plano);
  if (data && objPlanAss) {
    data.plano = objPlanAss;
  }
  return data;
};

exports.allUsers = async (req, res) => {
  const { from = 0, to = 30, q, planos, ids } = req.query;

  let search = {};
  if (q) {
    search.email = { $regex: q, $options: "i" };
  }
  if (planos) {
    search.plano = { $in: planos.split(",") };
  }
  if (ids) {
    search._id = { $in: ids.split(",").map((x) => x.trim()) };
  }

  const total = await UsuarioModel.countDocuments(search);
  let data = await UsuarioModel.find(search)
    .skip(from)
    .limit(to - from)
    .lean()
    .exec();

  const planosAss = await listPlanosAssinatura();
  data = data.map((user) => {
    const planAss = planosAss.data.find((p) => p._id == user.plano);
    if (planAss) {
      return {
        ...user,
        plano: planAss,
      };
    }
    return user;
  });

  return {
    data,
    meta: {
      total,
      from,
      to,
      q,
      search,
    },
  };
};

exports.forgotPasswordSendCode = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new Error("Email é obrigatório");
  }

  const emailParts = email
    .split("@")
    .map((x) => x.replace(/[^a-z0-9\-_.]/gi, ""));
  const emailRegex = `^${emailParts[0]}@${emailParts[1]}$`;
  const usuarioObj = await UsuarioModel.findOne({
    email: { $regex: emailRegex, $options: "i" },
  });
  if (!usuarioObj) {
    throw new Error(`Conta com email ${email} não encontrada`);
  }

  const verificationCode = id6();
  const nowPlus15min = new Date(+new Date() + 900000);

  const usuarioObj2 = await UsuarioModel.findByIdAndUpdate(
    usuarioObj._id,
    { resetId: verificationCode, resetMaxDate: nowPlus15min },
    { new: true, runValidators: true }
  );
  if (!usuarioObj2) throw new Error("Erro ao preparar código verificador");

  await sendEmail({
    email: email,
    name: email,
    type: EMAIL_TYPES.FORGOT_PASSWORD,
    params: {
      verificationCode,
    },
  });

  return true;
};

exports.forgotPasswordResetWithCode = async (req, res) => {
  const { email, code, newSenha } = req.body;
  if (!email) {
    throw new Error("Email é necessário para redefinir a senha");
  }
  if (!code) {
    throw new Error(
      "Código de verificação é necessário para redefinir a senha"
    );
  }
  if (!newSenha) {
    throw new Error("Nova Senha é necessária para redefinir a senha");
  }

  const emailParts = email
    .split("@")
    .map((x) => x.replace(/[^a-z0-9\-_.]/gi, ""));
  const emailRegex = `^${emailParts[0]}@${emailParts[1]}$`;
  const usuarioObj = await UsuarioModel.findOne({
    email: { $regex: emailRegex, $options: "i" },
  });

  if (!usuarioObj) {
    throw new Error(`Conta com email ${email} não encontrada`);
  }
  if (usuarioObj.resetId !== code && usuarioObj.resetId?.length > 4) {
    throw new Error(`Código de verificação inválido`);
  }
  if (new Date(usuarioObj.resetMaxDate) < new Date()) {
    throw new Error(`Código de verificação expirado`);
  }

  const hashSenha = await encryptPassword(newSenha);
  const usuarioObj2 = await UsuarioModel.findByIdAndUpdate(
    usuarioObj._id,
    { senha: hashSenha, resetId: "", resetMaxDate: "" },
    { new: true, runValidators: true }
  );
  if (!usuarioObj2) throw new Error("Erro ao alterar senha do usuário");

  await sendEmail({
    email: usuarioObj2.email,
    name: usuarioObj2.email,
    type: EMAIL_TYPES.PASSWORD_CHANGED,
  });

  return {
    _id: usuarioObj2._id,
    email: usuarioObj2.email,
    plano: usuarioObj2.plano,
  };
};

const fnRemocaoDados = async (id, email) => {
  const pfData = await PFModel.findByIdAndDelete(id);
  const pjData = await PJModel.findByIdAndDelete(id);
  if (!pfData && !pjData) {
    throw new Error("Nenhum dado encontrado para esse usuário");
  }

  let name = email;
  if (pfData) {
    name = pfData.nomePreferido;
    if (!name) name = [pfData.nomePrimeiro, pfData.nomeUltimo].join(" ");
  }
  if (pjData) {
    if (!name) name = pjData.nomeResponsavel;
    if (!name) name = pjData.nomeFantasia;
    if (!name) name = pjData.razaoSocial;
  }

  // await sendEmail({ email, name, type: EMAIL_TYPES.REMOCAO_DADOS });

  return {
    pfData,
    pjData,
  };
};

exports.remocaoDados = async (req, res) => {
  if (!req.usuario?._id) throw new Error("Usuário não encontrado na sessão");
  return await fnRemocaoDados(req.usuario?._id, req.usuario.email);
};
exports.remocaoHistorico = async (req, res) => {
  if (!req.usuario?._id) throw new Error("Usuário não encontrado na sessão");
  throw new Error("Não implementado");
  // Vagas Salvas
  // Propostas
};
exports.remocaoTotal = async (req, res) => {
  if (!req.usuario?._id) throw new Error("Usuário não encontrado na sessão");
  try {
    await fnRemocaoDados(req.usuario?._id, req.usuario.email);
  } catch (e) {}
  return await UsuarioModel.findByIdAndDelete(req.usuario?._id);
};

// subscription data

exports.getInfoSubscription = async (req, res) => {
  if (!req.usuario?._id) throw new Error("Usuário não encontrado na sessão");
  const subscription_id = req.usuario.subscription_id;
  if (!subscription_id) throw new Error("Usuário não tem Assinatura ativa");

  return await getSubscriptionInGateway(subscription_id);
};

exports.getInfoSubscriptionInvoices = async (req, res) => {
  if (!req.usuario?._id) throw new Error("Usuário não encontrado na sessão");
  const subscription_id = req.usuario.subscription_id;
  if (!subscription_id) throw new Error("Usuário não tem Assinatura ativa");
  
  return await getSubscriptionInvoicesInGateway(subscription_id);
};

exports.getInfoInvoicePayments = async (req, res) => {
  if (!req.params?.invoiceId) throw new Error("Invoice não informada");
  return await getSubscriptionPaymentInGateway(req.params.invoiceId);
};

// pagbank customer gateway data

exports.getInfoCustomer = async (req, res) => {
  if (!req.usuario?._id) throw new Error("Usuário não encontrado na sessão");
  const gateway_id = req.usuario.gateway_id;
  if (!gateway_id) throw new Error("Usuário não tem Dados de Pagamento");

  return await getCustomerFromGateway(gateway_id);
};
