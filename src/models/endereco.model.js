const mongoose = require("mongoose");

const EnderecoSchema = new mongoose.Schema({
  _id: { type: String, required: true, },
  
  cep: { type: String },
  state: { type: String },
  city: { type: String },
  neighborhood: { type: String },
  street: { type: String },
  number: { type: String },
  address2: { type: String },

}, { _id: false });

const Endereco = mongoose.model("Endereco", EnderecoSchema);

module.exports = Endereco;







