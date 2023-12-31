const mongoose = require("mongoose");
const strToSlug = require("../helpers/strToSlug")

const QualificacaoSchema = require("../schemas/qualificacao.schema");
const QualificacaoModel = mongoose.model("Qualificacao", QualificacaoSchema);


exports.create = async (req, res) => {
  const { nome, descricao, pai } = req.body;
  if (!nome) throw new Error("Nome da qualificação é obrigatório");

  const _id = strToSlug(nome);
  const qualificacaoExists = await QualificacaoModel.findById(_id);
  if (qualificacaoExists) throw new Error("Qualificação já existe");

  const data = { _id, nome };
  if (descricao) data.descricao = descricao;
  if (pai) {
    const objPai = await QualificacaoModel.findById(pai);
    if (!objPai) throw new Error(`Qualificação pai "${pai}" não existe`);
  }

  const qualificacao = await QualificacaoModel.create(data);
  if (!qualificacao) throw new Error("Erro ao criar qualificação");

  return qualificacao;
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { nome, descricao, valid, pai } = req.body;
  
  if (nome) {
    const newId = strToSlug(nome);
    const qualificacaoExists = await QualificacaoModel.findById(newId);
    if (qualificacaoExists) throw new Error("Qualificação já existe");
  }

  const data = { nome };
  if (descricao != null) data.descricao = descricao;
  if (pai) {
    const objPai = await QualificacaoModel.findById(pai);
    if (!objPai) throw new Error(`Qualificação pai "${pai}" não existe`);
  }

  if (valid !== null && valid !== undefined) {
    data.valid = valid;
  }

  const qualificacao = await QualificacaoModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!qualificacao) throw new Error("Erro ao atualizar qualificação");

  return qualificacao;
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const qualificacao = await QualificacaoModel.findByIdAndDelete(id);
  if (!qualificacao) throw new Error("Qualificação não encontrada");
  return {
    qualificacao: qualificacao._doc,
    deleted: true,
  };
};

exports.list = async (req, res) => {
  const { from = 0, to = 30, q, valid } = req.query;

  let search = { valid: true };
  if (valid != null) {
    search = {};
    if (valid === 'yes') search.valid = true;
    if (valid === 'no') search.valid = false;
  }
  if (q) {
    search.nome = { $regex: q, $options: "i" };
  }

  const total = await QualificacaoModel.countDocuments(search);
  let data = await QualificacaoModel.find(search)
    .skip(from)
    .limit(to - from)
    .exec();

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

// const pageSize = 100;
// const pageNumber = 1;
// const data = await MyModel
//   .find(search) // { name: { $regex: "partia", $options: "i" } })
//   .sort({ createdAt: -1 })
//   .skip(pageSize * (pageNumber - 1))
//   .limit(pageSize)
//   .exec((error, items) => {
//     if (error) throw new Error(error);
//     MyModel.countDocuments().exec((countError, count) => {
//       if (countError) {
//         throw new Error(countError);
//       }
//       return {
//         data,
//         total: Math.ceil(count / pageSize),
//         current: pageNumber,
//       };
//     });
//   });
