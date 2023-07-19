const mongoose = require('mongoose');
const { TIPO_ESCOLARIDADE } = require('./enums');

const EscolaridadeSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  nivel: { type: String, required: true, enum: Object.values(TIPO_ESCOLARIDADE), },
  isCompleto: { type: String },
  inicio: { type: String, required: true },
  fim: { type: String },
});

module.exports = EscolaridadeSchema;