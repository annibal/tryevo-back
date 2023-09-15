const mongoose = require('mongoose');
const { TIPO_ESCOLARIDADE, STATUS_ESCOLARIDADE } = require('./enums');

const EscolaridadeSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  nivel: { type: String, required: true, enum: Object.values(TIPO_ESCOLARIDADE), },
  status: { type: String, required: true, enum: Object.values(STATUS_ESCOLARIDADE) },
  dataConclusao: { type: Date },
  dataInicio: { type: Date },
  dataPrevisaoTermino: { type: Date },
});

module.exports = EscolaridadeSchema;