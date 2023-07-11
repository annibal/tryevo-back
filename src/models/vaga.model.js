const mongoose = require("mongoose");

const VagaSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  descricao: {
    type: String,
    required: true,
  },
}, { _id: false });

const Vaga = mongoose.model("Vaga", VagaSchema);

module.exports = Vaga;