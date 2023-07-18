const express = require("express");
const app = express();
const id6 = require("../helpers/id6");
const mongoose = require("mongoose");
const UsuarioSchema = require("../schemas/usuario.schema");

const UsuarioModel = mongoose.model('Usuario', UsuarioSchema)







app.get("/usuario-schema", async (req, res) => {
  res.send(UsuarioSchema.obj);
})

// Create
app.post("/usuario", async (req, res) => {
  const data = req.body;
  data._id = id6();
  
  try {
    const usuario = new UsuarioModel(data);
    await usuario.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update
app.patch("/usuario/:id", async (req, res) => {
  const data = req.body;

  try {
    const usuario = await UsuarioModel.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true },
    );
    if (!usuario) {
      res.status(404).send();
    } else {
      res.send(usuario);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete
app.delete("/usuario/:id", async (req, res) => {
  try {
    const usuario = await UsuarioModel.findByIdAndRemove(req.params.id);
    
    if (!usuario) {
      res.status(404).send();
    } else {
      res.send(usuario);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// List
app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await UsuarioModel.find(req.query);
    res.send(usuarios);
  } catch (error) {
    res.status(500).send(error);
  }
});
