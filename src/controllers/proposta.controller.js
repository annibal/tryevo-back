const mongoose = require("mongoose");
const id6 = require("../helpers/id6");
const vagaController = require("./vaga.controller");
const infoController = require("./info.controller");
const authController = require("./auth.controller");

const PropostaSchema = require("../schemas/proposta.schema");
const VagaSchema = require("../schemas/vaga.schema");
const PFSchema = require("../schemas/pf.schema");

const PropostaModel = mongoose.model("Proposta", PropostaSchema);
const VagaModel = mongoose.model("Vaga", VagaSchema);
const PFModel = mongoose.model("PF", PFSchema);

exports.create = async (req, res) => {
  const data = {
    _id: id6(),
    candidatoId: req.usuario._id,
    vagaId: req.body.vagaId,
    questoes: (req.body.questoes || []).map((q) => {
      const r = {};
      if (q.pergunta != null && q.pergunta?.length > 0) {
        r.pergunta = `${q.pergunta}`;
      }
      if (q.resposta != null && q.resposta?.length > 0) {
        r.resposta = `${q.resposta}`;
      }
      return r;
    }),
  };

  const proposta = await PropostaModel.findOne({
    candidatoId: req.usuario._id,
    vagaId: req.body.vagaId,
  }).lean();
  if (proposta) {
    throw new Error("Proposta já existe");
  }

  const vaga = await VagaModel.findById(req.body.vagaId).lean();
  if (!vaga) {
    throw new Error("Vaga não existe");
  }

  return await PropostaModel.create(data);
};

exports.verDados = async (req, res) => {
  const id = req.params.id;
  let proposta = await PropostaModel.findById(id).lean();
  if (!proposta) throw new Error("Proposta não encontrada");

  const candidato = await infoController.showPF({
    ...req,
    params: { id: proposta.candidatoId },
  });
  if (!candidato) throw new Error("Dados do candidato não encontrados");

  const usuario = await authController.getSingleUser({
    ...req,
    params: { id: proposta.candidatoId },
  })
  candidato.email = (usuario || {}).email;

  proposta = await PropostaModel.findByIdAndUpdate(
    id,
    { ...proposta, viuDados: true },
    { new: true, runValidators: true }
  );
  if (!proposta) throw new Error("Erro ao registrar proposta como visualizada");

  return candidato;
};

exports.setContratado = async (req, res) => {
  const id = req.params.id;
  let proposta = await PropostaModel.findById(id).lean();
  if (!proposta) throw new Error("Proposta não encontrada");

  proposta = await PropostaModel.findByIdAndUpdate(
    id,
    { ...proposta, contratou: true },
    { new: true, runValidators: true }
  );
  if (!proposta) throw new Error("Erro ao registrar proposta como contratada");

  // TODO: Update Vaga

  return proposta;
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const proposta = await PropostaModel.findById(id);
  if (!proposta) throw new Error("Proposta não encontrada");

  await PropostaModel.findByIdAndDelete(id);
  return {
    proposta,
    deleted: true,
  };
};

exports.show = async (req, res) => {
  const id = req.params.id;
  let proposta = await PropostaModel.findById(id).lean();

  if (!proposta) throw new Error("Proposta não encontrada");
  const vaga = await vagaController.show({
    ...req,
    params: { id: proposta.vagaId },
  });
  proposta.vaga = vaga;

  return proposta;
};

exports.showPJ = async (req, res) => {
  const id = req.params.id;
  let proposta = await PropostaModel.findById(id).lean();
  if (!proposta) throw new Error("Proposta não encontrada");

  const vaga = await vagaController.show({
    ...req,
    params: { id: proposta.vagaId },
  });
  proposta.vaga = vaga;

  // console.log("\n\n\n\n", proposta.vagaId, vaga, "\n\n\n\n");

  const candidatoObj = await infoController.showPF({
    ...req,
    params: { id: proposta.candidatoId },
  });
  const candidato = candidatoObj || {};

  // console.log("\n\n\n\n", proposta.candidatoId, candidato, "\n\n\n\n");
  
  proposta.matchResult = vagaController.getVagaMatch(vaga, candidato);

  if (proposta.viuDados) {
    const usuario = await authController.getSingleUser({
      ...req,
      params: { id: proposta.candidatoId },
    })
    candidato.email = (usuario || {}).email;

    proposta.candidato = candidato
  } else {
    proposta.candidato = {
      nomePrimeiro: candidato.nomePrimeiro,
      nomeUltimo: candidato.nomeUltimo,
      nomePreferido: candidato.nomePreferido,
      genero: candidato.genero,
      nascimento: candidato.nascimento,
      pcd: candidato.pcd,
      habilidades: candidato.habilidades,
      objetivos: candidato.objetivos,
      projetosPessoais: candidato.projetosPessoais,
      escolaridades: candidato.escolaridades,
      experienciasProfissionais: candidato.experienciasProfissionais,
      cursos: candidato.cursos,
    };
  }

  return proposta;
};

exports.listPF = async (req, res) => {
  const search = { candidatoId: req.usuario._id };

  const total = await PropostaModel.countDocuments(search);
  const propostas = await PropostaModel.find(search)
    .lean()
    .sort({ createdAt: -1 })
    .exec();

  const vagaIds = Array.from(new Set(propostas.map((x) => x.vagaId)));
  const vagasResponse = await vagaController.list({
    ...req,
    query: {
      id: vagaIds.join(","),
      from: 0,
      to: 999999,
    },
  });

  const vagas = vagasResponse?.data || [];
  // console.log("\n\n\n\n", vagaIds, vagasResponse.meta, "\n\n\n\n");

  const data = (propostas || []).map((proposta) => ({
    ...proposta,
    vaga: vagas.find((v) => v._id === proposta.vagaId),
  }));

  return {
    data,
    meta: {
      total,
      search,
    },
  };
};

exports.listPJ = async (req, res) => {
  const qVaga = req.query?.vaga;

  const myVagasResponse = await vagaController.listMine(req, res);
  let myVagas = myVagasResponse?.data || [];
  
  if (qVaga != null && qVaga.length > 0) {
    myVagas = myVagas.filter(x => x._id === qVaga)
  }

  const myVagaIds = myVagas.map((x) => x._id);
  const search = { vagaId: { $in: myVagaIds } };

  // console.log("\n\n\n\n", myVagaIds, myVagasResponse.meta, "\n\n\n\n");

  const total = await PropostaModel.countDocuments(search);
  const propostas = await PropostaModel.find(search)
    .lean()
    .sort({ createdAt: -1 })
    .exec();

  const candidatoIds = Array.from(new Set(propostas.map((x) => x.candidatoId)));
  const objCandidatos = await PFModel.find({ _id: { $in: candidatoIds } });
  const candidatos = objCandidatos || [];

  // console.log("\n\n\n\n", candidatoIds, objCandidatos.length, "\n\n\n\n");

  const data = (propostas || []).map((proposta) => {
    const pf = candidatos.find((v) => v._id === proposta.candidatoId);
    const vaga = myVagas.find((v) => v._id === proposta.vagaId)
    const matchResult = vagaController.getVagaMatch(vaga, pf);
    return {
      ...proposta,
      vaga,
      matchResult,
      candidato: {
        genero: pf?.genero,
        nomePreferido: pf?.nomePreferido,
        nomePrimeiro: pf?.nomePrimeiro,
        nomeUltimo: pf?.nomeUltimo,
        nascimento: pf?.nascimento,
      },
    };
  });

  return {
    data,
    meta: {
      total,
      search,
    },
  };
};
