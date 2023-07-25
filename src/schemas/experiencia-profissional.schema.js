const mongoose = require('mongoose');

const ExperienciaProfissionalSchema = new mongoose.Schema({
  cargo: { type: String, required: true },
  empresa: { type: String, required: true },
  descricao: { type: String },
  inicio: { type: Date, required: true },
  fim: { type: Date },
  isAtual: { type: String },
  qualificacoes: { type: [ String ] },
});

module.exports = ExperienciaProfissionalSchema;