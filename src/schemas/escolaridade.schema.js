const mongoose = require('mongoose');

const EscolaridadeSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  nivel: { type: String, required: true },
  isCompleto: { type: String },
  inicio: { type: String, required: true },
  fim: { type: String },
});

module.exports = EscolaridadeSchema;