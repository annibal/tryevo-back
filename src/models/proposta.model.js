const mongoose = require("mongoose");

const PropostaSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  vaga: {
    type: String,
    required: true,
  },
  usuario: {
    type: String,
    required: true,
  },
  respostas: {
    type: [String],
    required: true,
  },
}, { _id: false });

const Proposta = mongoose.model("Proposta", PropostaSchema);

module.exports = Proposta;