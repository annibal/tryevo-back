const id6 = require("../helpers/id6");
const mongoose = require("mongoose");
const PlanAssSchema = require("../schemas/plano-assinatura.schema");
const {
  TIPO_PLANO_ASSINATURA,
  TIPO_FEATURE_PLANO_ASSINATURA,
  TIPO_VALOR_FEATURE_PLAN_ASS,
} = require("../schemas/enums");

const PlanAssModel = mongoose.model("PlanoAssinatura", PlanAssSchema);

const tiposPlanAss = Object.values(TIPO_PLANO_ASSINATURA);
const tiposFeaturePlanAss = Object.values(TIPO_FEATURE_PLANO_ASSINATURA);

// helpers

const TIPO_FEATURE_VALOR = (() => {
  const T = TIPO_PLANO_ASSINATURA;
  const F = TIPO_FEATURE_PLANO_ASSINATURA;
  const V = TIPO_VALOR_FEATURE_PLAN_ASS;
  return [
    { tipo: T.PF, feat: F.VER_DASHBOARD, val: V.VER },
    { tipo: T.PF, feat: F.VER_G_VAGAS_MES, val: V.VER },
    { tipo: T.PF, feat: F.VER_G_VAGAS_ESTADO, val: V.VER },
    { tipo: T.PF, feat: F.VER_G_CONTRATACOES_MES, val: V.VER },
    { tipo: T.PF, feat: F.VER_G_COMPETENCIAS_ESTADO, val: V.VER },
    { tipo: T.PF, feat: F.VER_NOME_EMPRESA, val: V.VER },
    { tipo: T.PF, feat: F.LIMITE_CANDIDATURAS, val: V.LIMITE },

    { tipo: T.PJ, feat: F.VER_DASHBOARD, val: V.VER },
    { tipo: T.PJ, feat: F.VER_G_VAGAS_MES, val: V.VER },
    { tipo: T.PJ, feat: F.VER_G_VAGAS_ESTADO, val: V.VER },
    { tipo: T.PJ, feat: F.VER_G_CONTRATACOES_MES, val: V.VER },
    { tipo: T.PJ, feat: F.VER_G_COMPETENCIAS_ESTADO, val: V.VER },
    { tipo: T.PJ, feat: F.VER_DADOS_CANDIDATO, val: V.VER },
    { tipo: T.PJ, feat: F.VER_CV_FULL, val: V.VER },
    { tipo: T.PJ, feat: F.LIMITE_VAGAS, val: V.LIMITE },
  ];
})();

const tipoFeatureValorCheck = (tipoValor, valorFeature) => {
  if (tipoValor === TIPO_VALOR_FEATURE_PLAN_ASS.VER) {
    if (typeof valorFeature === "boolean") {
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

async function listPlanosAssinatura(paramSearch) {
  const search = {};
  if (paramSearch.id) {
    if (paramSearch.id instanceof Array) {
      search._id = { $in: paramSearch.id };
    } else {
      search._id = paramSearch.id;
    }
  }
  if (paramSearch.tipo) {
    search.tipo = paramSearch.tipo;
  }
  if (paramSearch.active === true || paramSearch.active === false) {
    search.active = paramSearch.active;
  }

  const total = await PlanAssModel.countDocuments(search);
  let planAssData = await PlanAssModel.find(search).exec();

  return {
    data: planAssData,
    meta: {
      total,
      search,
    },
  };
}
async function showPlanoAssinatura(id) {
  return await PlanAssModel.findById(id);
}
async function listFeatures(tipo) {
  if (tipo) {
    return TIPO_FEATURE_VALOR.filter((tfv) => tfv.tipo === tipo);
  }
  return { data: TIPO_FEATURE_VALOR };
}

async function savePlanoAssinatura(paramData) {
  const planAssData = {};
  if (paramData.nome) {
    planAssData.nome = paramData.nome;
  }
  if (paramData.descricao) {
    planAssData.descricao = paramData.descricao;
  }
  if (paramData.tipo && tiposPlanAss.includes(paramData.tipo)) {
    planAssData.tipo = paramData.tipo;
  }
  if (paramData.active) {
    planAssData.active = !!paramData.active;
  }
  if (paramData.preco != null && !isNaN(paramData.preco)) {
    planAssData.preco = +paramData.preco;
  }
  if (paramData.descontoAnual != null && !isNaN(paramData.descontoAnual)) {
    planAssData.descontoAnual = +paramData.descontoAnual;
  }

  const dataFeatures = paramData.features || [];
  if (dataFeatures.length > 0) {
    const planAssFeatures = [];
    dataFeatures.forEach((feature) => {
      const tipoFeatureValor = TIPO_FEATURE_VALOR.find((tfv) => {
        return (
          tfv.tipo === paramData.tipo &&
          tfv.feat === feature.key &&
          tipoFeatureValorCheck(tfv.val, feature.value)
        );
      });

      if (tipoFeatureValor) {
        planAssFeatures.push({
          key: feature.key,
          value: feature.value,
        });
      }
    });

    if (planAssFeatures.length > 0) {
      planAssData.features = planAssFeatures;
    }
  }

  if (paramData.id) {
    planAssData._id = paramData.id;
    return await PlanAssModel.findByIdAndUpdate(paramData.id, planAssData, {
      new: true,
      runValidators: true,
    });
  } else {
    planAssData._id = id6();
    planAssData.ownerId = paramData._id;
    return await PlanAssModel.create(planAssData);
  }
}
async function deletePlanoAssinatura(id) {
  const planAss = await PlanAssModel.findById(id);
  if (!planAss) throw new Error("Plano de Assinatura não encontrado");

  await PlanAssModel.findByIdAndDelete(id);

  return {
    planoAssinatura: planAss,
    deleted: true,
  };
}

// migration

async function legacyUpdateUsers() {
  // get all users
  // update legacy plano for each
}

// router fns

async function handleGet(req, res) {
  const search = {};

  if (req.query.id) {
    search.id = req.query.id.split(",");
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
async function handleGetSingle(req, res) {
  return await showPlanoAssinatura(req.params.id);
}
async function handleDelete(req, res) {
  return await deletePlanoAssinatura(req.params.id);
}
async function handlePost(req, res) {
  return await savePlanoAssinatura(req.body);
}

module.exports = {
  TIPO_FEATURE_VALOR,
  tipoFeatureValorCheck,

  listPlanosAssinatura,
  showPlanoAssinatura,
  listFeatures,
  savePlanoAssinatura,
  deletePlanoAssinatura,

  legacyUpdateUsers,

  handleGet,
  handleGetFeatures,
  handleGetSingle,
  handleDelete,
  handlePost,
}