const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  senha: {
    type: String,
    required: true,
  },
}, { _id: false });

const Usuario = mongoose.model("Usuario", UsuarioSchema);

module.exports = Usuario;