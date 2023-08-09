const mongoose = require('mongoose');

const Habilidade = new mongoose.Schema({
  _id: { type: String, required: true, },
  nome: { type: String, required: true },
}, { _id: false });

module.exports = Habilidade;