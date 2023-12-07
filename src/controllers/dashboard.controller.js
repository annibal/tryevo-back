const mongoose = require("mongoose");
const {
  TIPO_PLANO_ASSINATURA,
  TIPO_FEATURE_PLANO_ASSINATURA: FEAT,
} = require("../schemas/enums");
const aggregateData = require("../helpers/aggregateData");

const UsuarioSchema = require("../schemas/usuario.schema");
const PFSchema = require("../schemas/pf.schema");
const PJSchema = require("../schemas/pj.schema");
const CBOSchema = require("../schemas/cbo.schema");
const HabilidadeSchema = require("../schemas/habilidade.schema");
const QualificacaoSchema = require("../schemas/qualificacao.schema");
const VagaSchema = require("../schemas/vaga.schema");
const PropostaSchema = require("../schemas/proposta.schema");
const capitalize = require("../helpers/capitalize");

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
const mock = {
  estados: ["SP", "RJ", "BA", "BH", "ES", "RS", "Mato Grosso do Sul"],
  cidades: [
    "Cidade",
    "Outra Cidade",
    "Cidadosa",
    "Cidadela",
    "City",
    "Cidade Vila",
    "Cidona",
  ],
  cargos: [
    "Abacaxicultor",
    "Gerente Administrativo",
    "Auxiliar Administrativo",
    "Diretor de Vendas",
    "Coordenador Executivo",
    "Coordenador de Mídias",
    "Gerente Comercial",
  ],
  competencias: [
    "Javascript",
    "Excel",
    "Análise",
    "Gerência",
    "CSS",
    "MySQL",
    "ABAP",
  ],
  habilidades: [
    "Flexibilidade",
    "Liderança",
    "Trabalho em Equipe",
    "Diagnóstico e Resolução de Problemas",
    "Tomada de Decisões",
    "Análise de Informação",
    "Ferramentas de Organização e Produtividade",
  ],
};

const fillTimeBuckets = (dataObj, limit) => {
  let sum = 0;
  const dataBuckets = Array(limit)
    .fill()
    .map((_, i) => {
      dt = new Date();
      dt.setDate(1);
      dt.setMonth(dt.getMonth() - limit + i + 1);
      const time = dt.toJSON().slice(0, 8) + "01";
      sum += dataObj[time] || 0;
      return { time, value: sum };
    });
  //
  return dataBuckets;
};

const fromAggToTimeValue = (aggObj) =>
  (aggObj || []).reduce((all, curr) => {
    const time = [
      curr._id.year,
      (curr._id.month + 1).toString().padStart(2, "0"),
      "01",
    ].join("-");

    return {
      ...all,
      [time]: curr.count,
    };
  }, {});

const withLookup = async (data, joinModel, localField, foreignField, as) => {
  const ids = Array.from(
    new Set((data || []).map((item) => item[localField]).filter((x) => x))
  );
  let objJoins = [];
  if (ids.length > 0) {
    objJoins = await joinModel
      .find({
        _id: { $in: ids },
      })
      .lean();
  }

  const result = (data || []).map((item) => {
    const lookedUpObj = objJoins.find(
      (x) => x[foreignField] === item[localField]
    );
    return {
      ...item,
      [as]: lookedUpObj,
    };
  });

  return result;
};

const featureFns = {
  // PF
  [FEAT.VER_G_VAGAS_REGIAO]: async function (params) {
    // return genMockData(params.estado ? mock.cidades : mock.estados, 20, 600);

    const agg = await VagaModel.aggregate(
      [
        {
          $match: {
            active: true,
          },
        },
        {
          $lookup: {
            from: "pjs",
            let: { empresa: "$ownerId" },
            pipeline: [{ $match: { $expr: { $eq: ["$$empresa", "$_id"] } } }],
            as: "empresa",
          },
        },
        {
          $unwind: "$empresa",
        },
        {
          $group: params.estado
            ? {
                _id: {
                  $ifNull: ["$endereco.cidade", "$empresa.endereco.cidade"],
                },
                estado: {
                  $first: {
                    $ifNull: ["$endereco.estado", "$empresa.endereco.estado"],
                  },
                },
                count: { $sum: 1 },
              }
            : {
                _id: {
                  $ifNull: ["$endereco.estado", "$empresa.endereco.estado"],
                },
                count: { $sum: 1 },
              },
        },
        params.estado
          ? {
              $match: {
                estado: params.estado,
              },
            }
          : null,
        { $sort: { count: -1 } },
        { $limit: +(params?.limit || 10) },
        {
          $match: {
            _id: { $ne: null },
          },
        },
        {
          $project: {
            name: "$_id",
            value: "$count",
          },
        },
      ].filter((x) => !!x)
    );

    return agg;
  },
  [FEAT.VER_G_EVO_VAGAS]: async function (params) {
    // return genMockData(12, 20, 600);

    const agg = await VagaModel.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const dataObj = fromAggToTimeValue(agg);

    const nMonths = +(params?.limit || 12);
    const dataBuckets = fillTimeBuckets(dataObj, nMonths);
    // return { agg, dataObj, data: dataBuckets };
    return dataBuckets;
  },
  [FEAT.VER_G_TOP_CARGOS]: async function (params) {
    // return genMockData(mock.cargos, 20, 600);

    const limit = +(params?.limit || 10);
    const agg = await VagaModel.aggregate([
      {
        $match: {
          active: true,
          cargo: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$cargo",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    const hydratedAgg = await withLookup(agg, CBOModel, "_id", "_id", "cargo");

    const data = hydratedAgg.map((item) => ({
      name: capitalize(item.cargo?.nome || "?"),
      value: item.count,
    }));

    return data;
  },
  [FEAT.VER_G_EVO_EMPRESAS]: async function (params) {
    // return genMockData(12, 20, 600);
    const agg = await PJModel.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const dataObj = fromAggToTimeValue(agg);

    const nMonths = +(params?.limit || 12);
    const dataBuckets = fillTimeBuckets(dataObj, nMonths);
    return dataBuckets;
  },
  [FEAT.VER_G_SALARIO_CARGOS]: async function (params) {
    // return genMockData(mock.cargos, 1, 1);

    const agg = await VagaModel.aggregate([
      { $match: { cargo: { $ne: null } } },
      {
        $group: {
          _id: "$cargo",
          // salarioMinimo: { $avg: "$salarioMinimo" },
          // salarioMaximo: { $avg: "$salarioMaximo" },
          value: {
            $avg: {
              $divide: [{ $add: ["$salarioMinimo", "$salarioMaximo"] }, 2],
            },
          },
        },
      },
      { $sort: { value: -1 } },
      { $limit: +(params?.limit || 10) },
      {
        $lookup: {
          from: "cbos",
          let: { cargo: "$_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$$cargo", "$_id"] } } }],
          as: "cargo",
        },
      },
      { $unwind: "$cargo" },
      {
        $project: {
          // name: "$_id",
          name: "$cargo.nome",
          // salarioMinimo: "$salarioMinimo",
          // salarioMaximo: "$salarioMaximo",
          value: "$value",
        },
      },
    ]);

    return agg;
  },

  // PJ
  [FEAT.VER_G_COMP_VAGAS]: async function (params) {
    // return genMockData(mock.competencias, 20, 600);
    const agg = await QualificacaoModel.aggregate([
      {
        $match: {
          valid: true,
        },
      },
      {
        $lookup: {
          from: "vagas",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$$id", "$qualificacoes"] },
                active: true,
              },
            },
          ],
          as: "vagas",
        },
      },
      {
        $project: {
          nome: "$nome",
          count_vagas: { $size: "$vagas" },
        },
      },
      {
        $group: {
          _id: "$nome",
          count: { $sum: "$count_vagas" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: +(params?.limit || 10) },
    ]);

    const data = agg.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    return data;
  },
  [FEAT.VER_G_COMP_CAND]: async function (params) {
    // return genMockData(mock.competencias, 20, 600);
    const agg = await QualificacaoModel.aggregate([
      { $match: { valid: true } },
      {
        $lookup: {
          from: "pfs",
          let: { id: "$_id" },
          pipeline: [
            { $unwind: "$experienciasProfissionais" },
            {
              $match: {
                $expr: {
                  $in: ["$$id", "$experienciasProfissionais.qualificacoes"],
                },
              },
            },
          ],
          as: "pfs",
        },
      },
      {
        $project: {
          nome: "$nome",
          count_candidatos: { $size: "$pfs" },
        },
      },
      {
        $group: {
          _id: "$nome",
          count: { $sum: "$count_candidatos" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: +(params?.limit || 10) },
    ]);

    const data = agg.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    return data;
  },
  [FEAT.VER_G_HABILIDADES_VAGAS]: async function (params) {
    // return genMockData(mock.habilidades, 20, 600);
    const agg = await HabilidadeModel.aggregate([
      {
        $lookup: {
          from: "vagas",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$$id", "$habilidades"] },
                active: true,
              },
            },
          ],
          as: "vagas",
        },
      },
      {
        $project: {
          nome: "$nome",
          count_vagas: { $size: "$vagas" },
        },
      },
      {
        $group: {
          _id: "$nome",
          count: { $sum: "$count_vagas" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: +(params?.limit || 10) },
    ]);

    const data = agg.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    return data;
  },
  [FEAT.VER_G_HABILIDADES_CAND]: async function (params) {
    // return genMockData(mock.habilidades, 20, 600);
    const agg = await HabilidadeModel.aggregate([
      {
        $lookup: {
          from: "pfs",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                habilidades: { $ne: null },
                $expr: { $in: ["$$id", "$habilidades"] },
              },
            },
          ],
          as: "pfs",
        },
      },
      {
        $project: {
          nome: "$nome",
          count_candidatos: { $size: "$pfs" },
        },
      },
      {
        $group: {
          _id: "$nome",
          count: { $sum: "$count_candidatos" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: +(params?.limit || 10) },
    ]);

    const data = agg.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    return data;
  },
  [FEAT.VER_G_CAND_FINALISTAS]: async function (params) {
    // return genMockData(12, 20, 600);

    const agg = await PropostaModel.aggregate([
      {
        $match: {
          contratou: true,
        },
      },
      {
        $group: {
          _id: {
            candidato: "$candidatoId",
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const dataObj = fromAggToTimeValue(agg);

    const nMonths = +(params?.limit || 12);
    const dataBuckets = fillTimeBuckets(dataObj, nMonths);
    // return { agg, dataObj, data: dataBuckets };
    return dataBuckets;
  },
  [FEAT.VER_G_EVO_CANDIDATURA]: async function (params) {
    // return [
    //   { time: "2023-01-01", candidaturas: 0, contratacoes: 0 },
    //   { time: "2023-02-01", candidaturas: 0, contratacoes: 0 },
    //   { time: "2023-03-01", candidaturas: 12, contratacoes: 1 },
    //   { time: "2023-04-01", candidaturas: 11, contratacoes: 0 },
    //   { time: "2023-05-01", candidaturas: 53, contratacoes: 32 },
    //   { time: "2023-06-01", candidaturas: 0, contratacoes: 15 },
    //   { time: "2023-07-01", candidaturas: 22, contratacoes: 7 },
    //   { time: "2023-08-01", candidaturas: 102, contratacoes: 65 },
    //   { time: "2023-09-01", candidaturas: 63, contratacoes: 42 },
    //   { time: "2023-10-01", candidaturas: 96, contratacoes: 78 },
    //   { time: "2023-11-01", candidaturas: 73, contratacoes: 15 },
    //   { time: "2023-12-01", candidaturas: 114, contratacoes: 67 },
    // ];

    const aggCandidaturas = await PropostaModel.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);
    const aggContratacoes = await PropostaModel.aggregate([
      {
        $match: {
          contratou: true,
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const dataObjCandidaturas = fromAggToTimeValue(aggCandidaturas);
    const dataObjContratacoes = fromAggToTimeValue(aggContratacoes);

    const nMonths = +(params?.limit || 12);
    const dataBucketsCandidaturas = fillTimeBuckets(
      dataObjCandidaturas,
      nMonths
    );
    const dataBucketsContratacoes = fillTimeBuckets(
      dataObjContratacoes,
      nMonths
    );
    const mergedData = dataBucketsCandidaturas.map((candidatura, idx) => ({
      time: candidatura.time,
      candidaturas: candidatura.value,
      time2: dataBucketsContratacoes[idx].time,
      contratacoes: dataBucketsContratacoes[idx].value,
    }));
    return mergedData;
  },
  [FEAT.VER_G_CONTRATACOES_CARGOS]: async function (params) {
    // return genMockData(mock.cargos, 0, 70);

    const agg = await PropostaModel.aggregate([
      {
        $match: {
          contratou: true,
        },
      },
      {
        $lookup: {
          from: "vagas",
          let: { vagaId: "$vagaId" },
          pipeline: [{ $match: { $expr: { $eq: ["$$vagaId", "$_id"] } } }],
          as: "vagas",
        },
      },
      { $unwind: "$vagas" },
      {
        $group: {
          _id: "$vagas.cargo",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: +(params?.limit || 10) },
      {
        $lookup: {
          from: "cbos",
          let: { cargo: "$_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$$cargo", "$_id"] } } }],
          as: "cargo",
        },
      },
      {
        $match: {
          _id: { $ne: null },
        },
      },
      {
        $project: {
          name: "$cargo.nome",
          value: "$count",
        },
      },
    ]);

    // const data = agg.map((item) => ({
    //   name: item._id,
    //   value: item.count,
    // }));

    return agg;
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
