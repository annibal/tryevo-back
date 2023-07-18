const express = require("express");
const app = express();
const mongoose = require("mongoose");
const UsuarioSchema = require("../schemas/usuario.schema");

const UsuarioModel = mongoose.model('Usuario', UsuarioSchema);

app.post("/login", async (req, res) => {
  const data = req.body;
  console.log({ data })
  const { email, senha } = data;
  
  try {
    const usuarioObj = await UsuarioModel.findOne({ email, senha });
    if (!usuarioObj) {
      res.status(404).send();
    } else {
      res.send(usuarioObj);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = app;