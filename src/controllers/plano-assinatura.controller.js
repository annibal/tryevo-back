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
  console.log(data);

  if (data.paymentMethod === "CREDIT_CARD") {
    try {
      const cust_id = await createCustomerInGateway({
        ...data.customer,
        holder: data.holder,
        card_encrypted: data.card_encrypted,
      });

      return cust_id;
    } catch (e) {
      console.log("Create Customer in Gateway Error:", {
        e: JSON.stringify(e.response.data),
      });
      console.log("Error log finished");
      throw new Error(e.response.data);
    }
  }
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

  legacyUpdateUsers,

  handleGet,
  handleGetFeatures,
  handleGetTipos,
  handleGetSingle,
  handleDelete,
  handlePost,
  handlePostSelect,
};
