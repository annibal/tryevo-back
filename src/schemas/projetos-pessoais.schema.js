const mongoose = require('mongoose');

const ProjetosPessoaisSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String },
  // url: { type: String },
  // quando: { type: Date, required: true },
});

module.exports = ProjetosPessoaisSchema;