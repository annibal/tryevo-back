const express = require("express");
const app = express();
const id6 = require("../helpers/id6");
const mongoose = require("mongoose");
const UsuarioSchema = require("../schemas/usuario.schema");

const UsuarioModel = mongoose.model('Usuario', UsuarioSchema)





exports.getSelf = async (req, res) => {
  
}
exports.postPF = async (req, res) => {
  
}
exports.postPJ = async (req, res) => {
  
}