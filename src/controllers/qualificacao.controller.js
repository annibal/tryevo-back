const express = require("express");
const id6 = require("../helpers/id6");
const mongoose = require("mongoose");

const QualificacaoSchema = require("../schemas/qualificacao.schema");
const QualificacaoModel = mongoose.model("Qualificacao", QualificacaoSchema);

exports.create = async (req, res) => {
  const { nome, descricao, pai } = req.body;
  if (!nome) throw new Error("Nome da qualificação é obrigatório");

  const data = { nome };
  if (descricao) data.descricao = descricao;
  if (pai) {
    const objPai = await QualificacaoModel.findById(pai);
    if (!objPai) throw new Error(`Qualificação pai "${pai}" não existe`);
  }
  data._id = id6();

  const qualificacao = await QualificacaoModel.create(data);
  if (!qualificacao) throw new Error("Erro ao criar qualificação");

  return qualificacao;
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { nome, descricao, pai } = req.body;

  const data = { nome };
  if (descricao) data.descricao = descricao;
  if (pai) {
    const objPai = await QualificacaoModel.findById(pai);
    if (!objPai) throw new Error(`Qualificação pai "${pai}" não existe`);
  }

  const qualificacao = await QualificacaoModel.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!qualificacao) throw new Error("Erro ao atualizar qualificação");

  return qualificacao;
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const qualificacao = await QualificacaoModel.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!qualificacao) throw new Error("Qualificação não encontrada");
  return {
    qualificacao: qualificacao._doc,
    deleted: true,
  };
};

exports.list = async (req, res) => {
  const q = req.query.q;
  const pageSize = 100;

  let search = {};
  if (q) search = { nome: { $regex: q, $options: "i" } };

  const data = await QualificacaoModel.find(search)
    .lean()
    .limit(pageSize)
    .exec();
  return data;
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
