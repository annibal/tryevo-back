const mongoose = require('mongoose');

const ProjetosPessoaisSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  url: { type: String },
  descricao: { type: String },
  quando: { type: Date, required: true },
});

module.exports = ProjetosPessoaisSchema;