const mongoose = require('mongoose');

const EnderecoSchema = new mongoose.Schema({
  cep: { type: String, required: true, minlength: 8 },
  pais: { type: String },
  estado: { type: String, required: true },
  cidade: { type: String, required: true },
  bairro: { type: String, required: true },
  rua: { type: String, required: true },
  numero: { type: String, required: true },
  complemento: { type: String },

  lat: { type: Number },
  lng: { type: Number },
  // isPrincipal: { type: Boolean, default: false },
});

module.exports = EnderecoSchema;







