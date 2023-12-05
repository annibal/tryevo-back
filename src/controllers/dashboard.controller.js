const mongoose = require("mongoose");
const {
  TIPO_PLANO_ASSINATURA,
  TIPO_FEATURE_PLANO_ASSINATURA: FEAT,
} = require("../schemas/enums");

const UsuarioSchema = require("../schemas/usuario.schema");
const PFSchema = require("../schemas/pf.schema");
const PJSchema = require("../schemas/pj.schema");
const CBOSchema = require("../schemas/cbo.schema");
const HabilidadeSchema = require("../schemas/habilidade.schema");
const QualificacaoSchema = require("../schemas/qualificacao.schema");
const VagaSchema = require("../schemas/vaga.schema");
const PropostaSchema = require("../schemas/proposta.schema");

const UsuarioModel = mongoose.model("Usuario", UsuarioSchema);
const PFModel = mongoose.model("PF", PFSchema);
const PJModel = mongoose.model("PJ", PJSchema);
const CBOModel = mongoose.model("CBO", CBOSchema);
const HabilidadeModel = mongoose.model("Habilidade", HabilidadeSchema);
const QualificacaoModel = mongoose.model("Qualificacao", QualificacaoSchema);
const VagaModel = mongoose.model("Vaga", VagaSchema);
const PropostaModel = mongoose.model("Proposta", PropostaSchema);

const featureFns = {
  [FEAT.VER_G_VAGAS_REGIAO]: async function (params) {
    // "VER_GRAFICO_VAGAS_REGIAO",
  },
  [FEAT.VER_G_EVO_VAGAS]: async function (params) {
    // "VER_GRAFICO_EVOLUCAO_VAGAS",
  },
  [FEAT.VER_G_TOP_CARGOS]: async function (params) {
    // "VER_GRAFICO_TOP_CARGOS",
  },
  [FEAT.VER_G_EVO_EMPRESAS]: async function (params) {
    // "VER_GRAFICO_EVOLUCAO_EMPRESAS",
  },
  [FEAT.VER_G_SALARIO_CARGOS]: async function (params) {
    // "VER_GRAFICO_SALARIO_CARGOS",
  },
  [FEAT.VER_G_COMP_VAGAS]: async function (params) {
    // "VER_GRAFICO_COMPETENCIAS_VAGAS",
  },
  [FEAT.VER_G_COMP_CAND]: async function (params) {
    // "VER_GRAFICO_COMPETENCIAS_CANDIDATOS",
  },
  [FEAT.VER_G_HABILIDADES_VAGAS]: async function (params) {
    // "VER_GRAFICO_HABILIDADES_VAGAS",
  },
  [FEAT.VER_G_HABILIDADES_CAND]: async function (params) {
    // "VER_GRAFICO_HABILIDADES_CANDIDATOS",
  },
  [FEAT.VER_G_CAND_FINALISTAS]: async function (params) {
    // "VER_GRAFICO_CANDIDATOS_FINALISTAS",
  },
  [FEAT.VER_G_EVO_CANDIDATURA]: async function (params) {
    // "VER_GRAFICO_EVOLUCAO_CANDIDATURA",
  },
  [FEAT.VER_G_CONTRATACOES_CARGOS]: async function (params) {
    // "VER_GRAFICO_CONTRATACOES_CARGOS",
  },
};

async function verifyChartPermissions(usuario, chartFeature, accountType) {

}

async function getDashboardData(usuario, chartFeature, accountType, params) {
  await verifyChartPermissions(usuario, chartFeature, accountType);

  const dataFn = featureFns[chartFeature];
  if (!dataFn) {}

  return await dataFn;
}


exports.handleGetDashboardData = async (req, res) => {
  return await getDashboardData();
};
exports.handlePostDashboardData = async (req, res) => {
  return await getDashboardData();
};
