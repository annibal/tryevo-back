const mongoose = require('mongoose');
const { TIPO_QUESTAO } = require("./enums");

const VagaQuestaoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  tipo: { type: String, enum: Object.values(TIPO_QUESTAO) },
  isObrigatorio: { type: Boolean, default: false },
  resposta: { type: String },
});

module.exports = VagaQuestaoSchema;