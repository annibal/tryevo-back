const mongoose = require("mongoose");
const id6 = require("../helpers/id6");
const vagaController = require("./vaga.controller");
const authController = require("./auth.controller");

const PropostaSchema = require("../schemas/proposta.schema");
const VagaSchema = require("../schemas/vaga.schema");

const PropostaModel = mongoose.model("Proposta", PropostaSchema);
const VagaModel = mongoose.model("Vaga", VagaSchema);

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

  const reqX = {
    ...req,
    query: {
      id: proposta.candidatoId,
      from: 0,
      to: 1,
    },
  };
  const objCandidatos = await authController.allUsers(reqX, res);
  const candidato = objCandidatos?.data?.[0];

  if (!candidato) throw new Error("Dados do candidato não encontrado");

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
  console.log("\n\n\n\n", vagaIds, vagasResponse.meta, "\n\n\n\n");

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
  const myVagasResponse = await vagaController.listMine(req, res);
  const myVagas = myVagasResponse?.data || [];
  const myVagaIds = myVagas.map((x) => x._id);
  const search = { _id: { $in: myVagaIds } };

  const total = await PropostaModel.countDocuments(search);
  const propostas = await PropostaModel.find(search)
    .lean()
    .sort({ createdAt: -1 })
    .exec();

  const data = (propostas || []).map((proposta) => ({
    ...proposta,
    vaga: myVagas.find((v) => v._id === proposta.vagaId),
  }));

  return {
    data,
    meta: {
      total,
      search,
    },
  };
};