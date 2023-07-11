const mongoose = require("mongoose");

const QualificacaoSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  nome: {
    type: String,
    required: true,
  },
  descricao: {
    type: String,
    required: true,
  },
}, { _id: false });

const Qualificacao = mongoose.model("Qualificacao", QualificacaoSchema);

module.exports = Qualificacao;