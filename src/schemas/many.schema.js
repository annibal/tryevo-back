const mongoose = require('mongoose');

const ManySchema = new mongoose.Schema({
  valor: { type: String, required: true },
  descricao: { type: String },
  tipo: { type: String, required: true },
  isPrimario: { type: Boolean, default: false },
});

module.exports = ManySchema;