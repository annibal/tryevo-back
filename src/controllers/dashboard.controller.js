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

const genMockData = (n, min, max) =>
  typeof n === "number"
    ? Array(n)
        .fill()
        .map((_, i) => ({
          time: `2023-${(i + 1).toString().padStart(2, "0", 2)}-01`,
          value: Math.floor(Math.random() * max) + min,
        }))
    : n.map((x) => ({
        name: x,
        value: Math.floor(Math.random() * max) + min,
      }));

const dataVagasCompetencia = [
  { name: "Javascript", value: 119889 },
  { name: "Excel", value: 81722 },
  { name: "Análise", value: 103426 },
  { name: "Gerência", value: 57168 },
  { name: "CSS", value: 106490 },
  { name: "MySQL", value: 68938 },
  { name: "ABAP", value: 65789 },
];
const dataVagasEstado = [
  { name: "SP", value: 93876 },
  { name: "RJ", value: 61559 },
  { name: "BA", value: 101266 },
  { name: "BH", value: 78323 },
  { name: "ES", value: 97901 },
  { name: "RS", value: 69897 },
  { name: "RN", value: 74242 },
];
const dataEvoCandidaturas = [
  { time: "2023-01-01", candidaturas: 0, contratacoes: 0 },
  { time: "2023-02-01", candidaturas: 0, contratacoes: 0 },
  { time: "2023-03-01", candidaturas: 12, contratacoes: 1 },
  { time: "2023-04-01", candidaturas: 11, contratacoes: 0 },
  { time: "2023-05-01", candidaturas: 53, contratacoes: 32 },
  { time: "2023-06-01", candidaturas: 0, contratacoes: 15 },
  { time: "2023-07-01", candidaturas: 22, contratacoes: 7 },
  { time: "2023-08-01", candidaturas: 102, contratacoes: 65 },
  { time: "2023-09-01", candidaturas: 63, contratacoes: 42 },
  { time: "2023-10-01", candidaturas: 96, contratacoes: 78 },
  { time: "2023-11-01", candidaturas: 73, contratacoes: 15 },
  { time: "2023-12-01", candidaturas: 114, contratacoes: 67 },
];

const featureFns = {
  // PF
  [FEAT.VER_G_VAGAS_REGIAO]: async function (params) {
    const items = params.estado
      ? [
          "Cidade",
          "Outra Cidade",
          "Cidadosa",
          "Cidadela",
          "City",
          "Cidade Vila",
          "Cidona",
        ]
      : ["SP", "RJ", "BA", "BH", "ES", "RS", "Mato Grosso do Sul"];
    return genMockData(items, 20, 600);
  },
  [FEAT.VER_G_EVO_VAGAS]: async function (params) {
    return genMockData(12, 20, 600);
  },
  [FEAT.VER_G_TOP_CARGOS]: async function (params) {
    const items = [
      "Abacaxicultor",
      "Gerente Administrativo",
      "Auxiliar Administrativo",
      "Diretor de Vendas",
      "Coordenador Executivo",
      "Coordenador de Mídias",
      "Gerente Comercial",
    ];
    return genMockData(items, 20, 600);
  },
  [FEAT.VER_G_EVO_EMPRESAS]: async function (params) {
    return genMockData(12, 20, 600);
  },
  [FEAT.VER_G_SALARIO_CARGOS]: async function (params) {
    const items = [
      "Abacaxicultor",
      "Gerente Administrativo",
      "Auxiliar Administrativo",
      "Diretor de Vendas",
      "Coordenador Executivo",
      "Coordenador de Mídias",
      "Gerente Comercial",
    ];
    return genMockData(items, 5000, 50000);
  },

  // PJ
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
  if (usuario?.plano?.isMasterAdmin) return true;

  if (!usuario || !usuario.plano) {
    throw new Error("Sem Permissão - Usuário não encontrado na sessão");
  }

  const userType = usuario?.plano?.tipo;
  if (!accountType.startsWith(userType)) {
    throw new Error(
      `Sem Permissão - Usuário do tipo "${userType}" sem acesso ao Gráfico de conta do tipo "${accountType}"`
    );
  }

  const userFeats = usuario?.plano?.features || {};
  if (!userFeats[chartFeature]) {
    throw new Error(
      `Sem Permissão - Plano do usuário não permite este Gráfico`
    );
  }

  return true;
}

async function getDashboardData(usuario, chartFeature, accountType, params) {
  await verifyChartPermissions(usuario, chartFeature, accountType);

  const dataFn = featureFns[chartFeature];
  if (!dataFn) {
    throw new Error(`Gráfico "${chartFeature}" não implementado`);
  }

  return await dataFn(params);
}

exports.handleGetDashboardData = async (req, res) => {
  return await getDashboardData(
    req.usuario,
    req.params.chart,
    req.params.type,
    req.query
  );
};
exports.handlePostDashboardData = async (req, res) => {
  return await getDashboardData(
    req.usuario,
    req.params.chart,
    req.params.type,
    req.body
  );
};
