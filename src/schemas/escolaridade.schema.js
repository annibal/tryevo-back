const mongoose = require('mongoose');
const { TIPO_ESCOLARIDADE } = require('./enums');

const EscolaridadeSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  nivel: { type: String, required: true, enum: Object.values(TIPO_ESCOLARIDADE), },
  isCompleto: { type: String },
  inicio: { type: Date, required: true },
  fim: { type: Date },
});

module.exports = EscolaridadeSchema;