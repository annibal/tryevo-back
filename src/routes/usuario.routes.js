const express = require("express");
const app = express();
const id6 = require("../helpers/id6");
const UsuarioSchema = require("../schemas/usuario.schema");
const mongoose = require("mongoose");

const UsuarioModel = mongoose.model('Usuario', UsuarioSchema)

app.post("/usuario", async (req, res) => {
  const data = req.body;
  data._id = id6();
  const usuario = new UsuarioModel(data);

  try {
    await usuario.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/usuario/:id", async (req, res) => {
  const data = req.body;
  data._id = req.params.id;
  const usuario = new UsuarioModel(data);

  try {
    await usuario.save();
    res.send(usuario);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete("/usuario/:id", async (req, res) => {
  const data = req.body;
  data._id = req.params.id;
  const usuario = new UsuarioModel(data);

  try {
    await usuario.delete();
    res.send({});
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/usuarios", async (req, res) => {
  const data = {}
  const usuarios = await UsuarioModel.find(req.query);

  try {
    res.send(usuarios);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/usuario/id", async (req, res) => {
  const data = {}
  data._id = req.params.id;
  const usuario = await UsuarioModel.find(data);

  try {
    res.send(usuario);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = app;