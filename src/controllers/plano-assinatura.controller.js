const id6 = require("../helpers/id6");
const mongoose = require("mongoose");
const {
  TIPO_PLANO_ASSINATURA,
  TIPO_FEATURE_PLANO_ASSINATURA,
  TIPO_VALOR_FEATURE_PLAN_ASS,
} = require("../schemas/enums");
const PlanAssSchema = require("../schemas/plano-assinatura.schema");
const UsuarioSchema = require("../schemas/usuario.schema");
const {
  updatePlanInGateway,
  createPlanInGateway,
  inactivatePlanInGateway,
  createCustomerInGateway,
  createSubscriptionInGateway,
  changeCustomerInGateway,
  cancelSubscriptionInGateway,
  getCustomerFromGateway,
  changeCustomerBillingInGateway,
} = require("./assinatura.gateway.controller");

const PlanAssModel = mongoose.model("PlanoAssinatura", PlanAssSchema);
const UsuarioModel = mongoose.model("Usuario", UsuarioSchema);

const tiposPlanAss = Object.values(TIPO_PLANO_ASSINATURA);
const tiposFeaturePlanAss = Object.values(TIPO_FEATURE_PLANO_ASSINATURA);

// helpers

const TIPO_FEATURE_VALOR = (() => {
  const T = TIPO_PLANO_ASSINATURA;
  const F = TIPO_FEATURE_PLANO_ASSINATURA;
  const V = TIPO_VALOR_FEATURE_PLAN_ASS;
  return [
    { tipo: T.PF, chave: F.VER_DASHBOARD, valType: V.VER },
    {
      tipo: T.PF,
      chave: F.VER_G_VAGAS_REGIAO,
      valType: V.VER,
      parent: F.VER_DASHBOARD,
    },
    {
      tipo: T.PF,
      chave: F.VER_G_EVO_VAGAS,
      valType: V.VER,
      parent: F.VER_DASHBOARD,
    },
    {
      tipo: T.PF,
      chave: F.VER_G_TOP_CARGOS,
      valType: V.VER,
      parent: F.VER_DASHBOARD,
    },
    {
      tipo: T.PF,
      chave: F.VER_G_EVO_EMPRESAS,
      valType: V.VER,
      parent: F.VER_DASHBOARD,
    },
    {
      tipo: T.PF,
      chave: F.VER_G_SALARIO_CARGOS,
      valType: V.VER,
      parent: F.VER_DASHBOARD,
    },
    { tipo: T.PF, chave: F.VER_NOME_EMPRESA, valType: V.VER },
    { tipo: T.PF, chave: F.LIMITE_CANDIDATURAS, valType: V.LIMITE },

    { tipo: T.PJ, chave: F.VER_DASHBOARD, valType: V.VER },
    {
      tipo: T.PJ,
      chave: F.VER_G_COMP_VAGAS,
      valType: V.VER,
      parent: F.VER_DASHBOARD,
    },
    {
      tipo: T.PJ,
      chave: F.VER_G_COMP_CAND,
      valType: V.VER,
      parent: F.VER_DASHBOARD,
    },
    {
      tipo: T.PJ,
      chave: F.VER_G_HABILIDADES_VAGAS,
      valType: V.VER,
      parent: F.VER_DASHBOARD,
    },
    {
      tipo: T.PJ,
      chave: F.VER_G_HABILIDADES_CAND,
      valType: V.VER,
      parent: F.VER_DASHBOARD,
    },
    {
      tipo: T.PJ,
      chave: F.VER_G_CAND_FINALISTAS,
      valType: V.VER,
      parent: F.VER_DASHBOARD,
    },
    {
      tipo: T.PJ,
      chave: F.VER_G_EVO_CANDIDATURA,
      valType: V.VER,
      parent: F.VER_DASHBOARD,
    },
    {
      tipo: T.PJ,
      chave: F.VER_G_CONTRATACOES_CARGOS,
      valType: V.VER,
      parent: F.VER_DASHBOARD,
    },
    { tipo: T.PJ, chave: F.VER_DADOS_CANDIDATO, valType: V.VER },
    { tipo: T.PJ, chave: F.VER_CV_FULL, valType: V.VER },
    { tipo: T.PJ, chave: F.LIMITE_VAGAS, valType: V.LIMITE },

    { tipo: T.MA, chave: F.ADMIN, valType: V.VER },
  ];
})();

const tipoFeatureValorCheck = (tipoValor, valorFeature) => {
  if (tipoValor === TIPO_VALOR_FEATURE_PLAN_ASS.VER) {
    if (valorFeature == 1) {
      return true;
    }
  }
  if (tipoValor === TIPO_VALOR_FEATURE_PLAN_ASS.LIMITE) {
    if (typeof valorFeature === "number" && !isNaN(valorFeature)) {
      return true;
    }
  }
  return false;
};

// controller methods

// id "1,2,3"
// tipo "PF"|"PJ"|"MA"
// active "true"|"false"
async function listPlanosAssinatura(paramSearch = {}) {
  const search = {};
  if (paramSearch.id) {
    if (paramSearch.id instanceof Array) {
      search._id = { $in: paramSearch._id };
    } else {
      search._id = paramSearch._id;
    }
  }
  if (paramSearch.tipo) {
    search.tipo = paramSearch.tipo;
  }
  if (paramSearch.active === true || paramSearch.active === false) {
    search.active = paramSearch.active;
  }

  const total = await PlanAssModel.countDocuments(search);
  let planAssData = await PlanAssModel.find(search).lean().exec();

  planAssData = planAssData.map((planoAssinatura) => {
    delete planoAssinatura.preco;
    delete planoAssinatura.descontoAnual;
    return planoAssinatura;
  });

  return {
    data: planAssData || [],
    meta: {
      total,
      search,
    },
  };
}
async function listTiposPlanosAssinatura() {
  return [
    { tipo: TIPO_PLANO_ASSINATURA.PF, nome: "PF - Candidato" },
    { tipo: TIPO_PLANO_ASSINATURA.PJ, nome: "PJ - Empresa" },
    { tipo: TIPO_PLANO_ASSINATURA.MA, nome: "Master Admin" },
  ];
}
async function showDefaultPlanoAssinatura(tipo) {
  if (!tiposPlanAss.includes(tipo)) {
    throw new Error(
      `Falha ao buscar plano padrão para o tipo "${tipo}": tipo não existe`
    );
  }

  return await await PlanAssModel.findOne({
    tipo: tipo,
    defaultForTipo: true,
    active: true,
  }).exec();
}
async function makePlanosAssinaturaNotDefault(tipo) {
  if (!tiposPlanAss.includes(tipo)) {
    throw new Error(
      `Falha ao atualizar planos do "${tipo}" para não-default: tipo não existe`
    );
  }

  const undefaultedPlanos = await PlanAssModel.updateMany(
    { tipo: tipo, defaultForTipo: true },
    { defaultForTipo: false },
    { new: true, runValidators: true }
  );

  console.info(`\nAtualizou ${undefaultedPlanos?.length} para não padrão\n`);
}
async function showPlanoAssinatura(id) {
  const planoAssinatura = await PlanAssModel.findById(id).lean();
  // delete planoAssinatura.preco;
  // delete planoAssinatura.descontoAnual;
  return planoAssinatura;
}
async function listFeatures(tipo) {
  if (tipo) {
    return TIPO_FEATURE_VALOR.filter((tfv) => tfv.tipo === tipo);
  }
  return { data: TIPO_FEATURE_VALOR };
}

// nome, tipo
// id?, defaultForTipo?, descricao?, active?, preco?, descontoAnual?
// features?: [ { key: "", value: true | 123 } ]
// modosDePagamento: [ { preco?: 123, meses?: 12, nome?: "", pagbankGatewayId?: "" } ]
async function savePlanoAssinatura(paramData) {
  const planAssData = {};
  if (paramData.nome) {
    planAssData.nome = paramData.nome;
  }
  if (paramData.descricao) {
    planAssData.descricao = paramData.descricao;
  }
  if (paramData.tipo) {
    if (tiposPlanAss.includes(paramData.tipo)) {
      planAssData.tipo = paramData.tipo;
    } else {
      throw new Error(
        `Tipo de plano de assinatura "${paramData.tipo}" inválido`
      );
    }
  }
  planAssData.active = !!paramData.active;

  const dataFeatures = paramData.features || [];
  if (dataFeatures.length > 0) {
    const planAssFeatures = [];
    dataFeatures.forEach((feature) => {
      const tipoFeatureValor = TIPO_FEATURE_VALOR.find((tfv) => {
        return (
          tfv.tipo === paramData.tipo &&
          tfv.chave === feature.chave &&
          tipoFeatureValorCheck(tfv.valType, feature.valor)
        );
      });

      if (tipoFeatureValor) {
        planAssFeatures.push({
          chave: feature.chave,
          valor: +feature.valor,
        });
      }
    });

    if (planAssFeatures.length > 0) {
      planAssData.features = planAssFeatures;
    }
  }

  if (paramData.defaultForTipo) {
    if (!planAssData.active) {
      throw new Error(
        `Falha ao salvar plano de assinatura: Plano padrão para o tipo "${paramData.tipo}" deve estar ativo`
      );
    }

    await makePlanosAssinaturaNotDefault(planAssData.tipo);
    planAssData.defaultForTipo = true;
  }

  const dataModosDePagamento = paramData.modosDePagamento || [];
  if (dataModosDePagamento.length > 0) {
    const planAssModosPagto = [];
    dataModosDePagamento.forEach((modoPagto) => {
      const objModoPagto = {};
      if (modoPagto.preco != null && !isNaN(modoPagto.preco)) {
        objModoPagto.preco = +modoPagto.preco;
      }
      if (modoPagto.meses != null && !isNaN(modoPagto.meses)) {
        objModoPagto.meses = +modoPagto.meses;
      }
      if (modoPagto.nome) {
        objModoPagto.nome = modoPagto.nome;
      }

      planAssModosPagto.push(objModoPagto);
    });

    if (planAssModosPagto.length > 0) {
      planAssData.modosDePagamento = planAssModosPagto;
    }
  }

  if (paramData._id) {
    planAssData._id = paramData._id;

    if (!paramData.defaultForTipo) {
      const otherDefaultPlanAss = await PlanAssModel.countDocuments({
        tipo: planAssData.tipo,
        defaultForTipo: true,
        _id: { $ne: planAssData._id },
      });
      if (otherDefaultPlanAss < 1) {
        throw new Error(
          [
            `Falha ao atualizar plano de assinatura para o tipo "${planAssData.tipo}":`,
            `é obrigatório 1 plano padrão para cada tipo.`,
          ].join(" ")
        );
      }
    }

    for (let i = 0; i < (planAssData.modosDePagamento || []).length; i++) {
      const modoPagto = planAssData.modosDePagamento[i];

      if (modoPagto.preco > 0) {
        const pagBankData = {
          id: planAssData._id + "_M" + modoPagto.meses,
          nome: planAssData.nome,
          preco: +modoPagto.preco,
          month_amount: modoPagto.meses,
          description: [planAssData.tipo, planAssData.descricao, modoPagto.nome]
            .filter((x) => x)
            .join(" | "),
        };

        if (modoPagto.pagbankGatewayId) {
          planAssData.modosDePagamento[i].pagbankGatewayId =
            await updatePlanInGateway(modoPagto.pagbankGatewayId, pagBankData);
        } else {
          planAssData.modosDePagamento[i].pagbankGatewayId =
            await createPlanInGateway(pagBankData);
        }
      }
    }

    for (let i = 0; i < (planAssData.idsRemove || []).length; i++) {
      await inactivatePlanInGateway(planAssData.idsRemove[i]);
    }

    return await PlanAssModel.findByIdAndUpdate(paramData._id, planAssData, {
      new: true,
      runValidators: true,
    });
  } else {
    planAssData._id = id6();

    for (let i = 0; i < (planAssData.modosDePagamento || []).length; i++) {
      const modoPagto = planAssData.modosDePagamento[i];

      if (modoPagto.preco > 0) {
        const pagBankData = {
          id: planAssData._id + "_M" + modoPagto.meses,
          nome: planAssData.nome,
          preco: +modoPagto.preco,
          month_amount: modoPagto.meses,
          description: [planAssData.tipo, planAssData.descricao, modoPagto.nome]
            .filter((x) => x)
            .join(" | "),
        };

        planAssData.modosDePagamento[i].pagbankGatewayId =
          await createPlanInGateway(pagBankData);
      }
    }

    return await PlanAssModel.create(planAssData);
  }
}
async function deletePlanoAssinatura(id) {
  const planAss = await PlanAssModel.findById(id);
  if (!planAss) throw new Error("Plano de Assinatura não encontrado");

  if (planAss.defaultForTipo) {
    throw new Error(
      `Operação não permitida: deletar plano padrão para tipo "${planAss.tipo}"`
    );
  }

  // check if users have the plan

  await PlanAssModel.findByIdAndDelete(id);

  return {
    planoAssinatura: planAss,
    deleted: true,
  };
}

// migration

async function legacyUpdateUsers() {
  const defaultPF = await showDefaultPlanoAssinatura(TIPO_PLANO_ASSINATURA.PF);
  const defaultPJ = await showDefaultPlanoAssinatura(TIPO_PLANO_ASSINATURA.PJ);

  await UsuarioModel.updateMany(
    { plano: { $in: ["PF_FREE", "PF_SMART", "PF_PREMIUM"] } },
    { plano: defaultPF._id }
  );
  await UsuarioModel.updateMany(
    { plano: { $in: ["PJ_FREE", "PJ_SMART", "PJ_PREMIUM", "PJ_ENTERPRISE"] } },
    { plano: defaultPJ._id }
  );

  return true;
}

async function selectPlanoAssinatura(data) {
  // console.log(data);

  if (!["CREDIT_CARD", "BOLETO"].includes(data.paymentMethod)) {
    throw new Error(`Método de pagamento "${data.paymentMethod}" inválido`);
  }

  // Prepara dados do usuário no PagSeguro (Customer Gateway)

  const customerData = {
    ...data.customer,
    holder: data.holder,
    card_encrypted: data.card_encrypted,
  };
  console.log("customerData: ", JSON.stringify(customerData, null, 2));

  let cust_id;

  if (data.customer_gateway_id) {
    // Usuário já tem Dados de Registration no PagSeguro

    const currentCustomerGateway = await getCustomerFromGateway(
      data.customer_gateway_id
    );
    const thisUser = await UsuarioModel.findById(data.userId).lean();

    if (currentCustomerGateway.tax_id === data.customer?.cpf_cnpj) {
      delete customerData.cpf_cnpj;

      cust_id = await changeCustomerInGateway(
        customerData,
        data.customer_gateway_id
      );

      await changeCustomerBillingInGateway(
        { card_encrypted: data.card_encrypted },
        cust_id
      );
    } else {
      // Usuário mudou o CPF (ou CNPJ) do pagamento, deve deletar e criar um novo
      cust_id = await createCustomerInGateway(customerData);
    }

    // Verifica se já tem Subscription para cancelar a assinatura atual

    if (thisUser.subscription_id) {
      console.log("will cancel subscription: " + thisUser.subscription_id);
      const cancelSubscriptionResponse = await cancelSubscriptionInGateway(
        thisUser.subscription_id
      );
      console.log(
        "cancelSubscriptionResponse: ",
        JSON.stringify(cancelSubscriptionResponse, null, 2)
      );
    }
  } else {
    // Cria o usuário no PagSeguro (Customer Gateway)

    cust_id = await createCustomerInGateway(customerData);

    // Atrela o id do Customer Gateway ao usuário no MongoDB

    await UsuarioModel.findByIdAndUpdate(data.userId, {
      gateway_id: cust_id,
    });
  }
  console.log("PagBank Customer ID: " + cust_id);

  if (data.paymentMethod === "CREDIT_CARD") {
    // Cria o Subscription, atrelando Plan com Customer

    const subscription_id = await createSubscriptionInGateway(
      cust_id,
      data.pagbankGatewayId,
      data.cvv
    );

    // Atrela o Subscription ao usuário no MongoDB

    await UsuarioModel.findByIdAndUpdate(data.userId, {
      subscription_id: subscription_id,
      plano: data.planAssId,
    });

    return {
      subscription_id,
      cust_id,
      user_id: data.userId,
    };
  }

  if (data.paymentMethod === "BOLETO") {
    throw new Error("Pagamento por Boleto não aceito ainda");
  }
}

async function downgradePlanoAssinatura(data) {
  if (data?.currentSubscriptionId) {
    await cancelSubscriptionInGateway(data.currentSubscriptionId);
    // try {
    // }
    // throw new Error(
    //   "Erro ao fazer downgrade do plano: Assinatura atual não encontrada"
    // );
  }
  if (!data?.tipoUsuario) {
    throw new Error(
      "Erro ao fazer downgrade do plano: Impossível definir se usuário é PF ou PJ"
    );
  }
  if (!data?.userId) {
    throw new Error("Erro ao fazer downgrade do plano: Usuário não encontrado");
  }


  const defaultPlan = await showDefaultPlanoAssinatura(data.tipoUsuario);

  await UsuarioModel.findByIdAndUpdate(data.userId, {
    plano: defaultPlan._id,
  });

  return true;
}

// router fns

async function handleGet(req, res) {
  const search = {};

  if (req.query.id) {
    search._id = req.query.id.split(",");
  }
  if (req.query.tipo) {
    search.tipo = req.query.tipo;
  }
  if (req.query.active) {
    if (
      req.query.active === "false" ||
      req.query.active === false ||
      req.query.active === "n" ||
      req.query.active === "N"
    ) {
      search.active = false;
    }
    if (
      req.query.active === "true" ||
      req.query.active === true ||
      req.query.active === "y" ||
      req.query.active === "Y"
    ) {
      search.active = true;
    }
  }

  return await listPlanosAssinatura(search);
}
async function handleGetFeatures(req, res) {
  return listFeatures(req.query.tipo);
}
async function handleGetTipos(req, res) {
  return listTiposPlanosAssinatura();
}
async function handleGetSingle(req, res) {
  return await showPlanoAssinatura(req.params.id);
}
async function handleDelete(req, res) {
  return await deletePlanoAssinatura(req.params.id);
}
async function handlePost(req, res) {
  return await savePlanoAssinatura(req.body);
}
async function handlePostSelect(req, res) {
  return await selectPlanoAssinatura(req.body);
}
async function handlePostDowngrade(req, res) {
  return await downgradePlanoAssinatura({
    currentSubscriptionId: req.usuario?.subscription_id,
    tipoUsuario: req.usuario?.plano?.tipo,
    userId: req.usuario?._id,
  });
}

module.exports = {
  TIPO_FEATURE_VALOR,
  tipoFeatureValorCheck,

  showDefaultPlanoAssinatura,
  listPlanosAssinatura,
  listTiposPlanosAssinatura,
  showPlanoAssinatura,
  listFeatures,
  savePlanoAssinatura,
  deletePlanoAssinatura,
  downgradePlanoAssinatura,

  legacyUpdateUsers,

  handleGet,
  handleGetFeatures,
  handleGetTipos,
  handleGetSingle,
  handleDelete,
  handlePost,
  handlePostSelect,
  handlePostDowngrade,
};
