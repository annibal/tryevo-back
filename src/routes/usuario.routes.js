const express = require("express");
const app = express();
const id6 = require("../helpers/id6");
const UsuarioModel = require("../models/usuario.model");

app.post("/usuario", async (req, res) => {
  const data = req.body;
  data._id = id6();
  const user = new UsuarioModel(data);

  try {
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/usuario/:id", async (req, res) => {
  const data = req.body;
  data._id = req.params.id;
  const user = new UsuarioModel(data);

  try {
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete("/usuario/:id", async (req, res) => {
  const data = req.body;
  data._id = req.params.id;
  const user = new UsuarioModel(data);

  try {
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/usuarios", async (req, res) => {
  const data = {}
  // req.query
  const users = await UsuarioModel.find(data);

  try {
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/usuario/id", async (req, res) => {
  const data = {}
  data._id = req.params.id;
  const user = await UsuarioModel.find(data);

  try {
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = app;