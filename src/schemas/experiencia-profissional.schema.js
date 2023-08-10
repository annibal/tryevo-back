const mongoose = require('mongoose');

const ExperienciaProfissionalSchema = new mongoose.Schema({
  empresa: { type: String, required: true },
  ramoAtividadeEmpresa: { type: String, required: true },
  descricao: { type: String },
  inicio: { type: Date, required: true },
  fim: { type: Date },
  isAtual: { type: String },
  qualificacoes: { type: [ String ] },
  cargo: { type: String },
});

module.exports = ExperienciaProfissionalSchema;