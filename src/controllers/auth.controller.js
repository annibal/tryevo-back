const express = require("express");
const bcrypt = require("bcryptjs");
const config = require("../config");
const jwt = require("jsonwebtoken");
const id6 = require("../helpers/id6");

const mongoose = require("mongoose");
const UsuarioSchema = require("../schemas/usuario.schema");
const { USUARIO_PLANOS } = require("../schemas/enums");
const UsuarioModel = mongoose.model("Usuario", UsuarioSchema);

const encryptPassword = async (password) => {
  const hash = await bcrypt.hash(password, 7);
  return hash;
};

const comparePassword = async (a, b) => {
  const isHashEqual = await bcrypt.compare(a, b);
  return isHashEqual;
}

const getAuthResponse = (usuarioObj) => {
  const data = {
    _id: usuarioObj._id,
    email: usuarioObj.email,
    plano: usuarioObj.plano,
  };
  data.token = jwt.sign(data, config.jwtSecret, {
    expiresIn: 2629800, // 3hrs in sec
  });
  return data;
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  if (!senha) throw new Error("Password not informed");
  
  const usuarioObj = await UsuarioModel.findOne({ email, });
  if (!usuarioObj) throw new Error("User not found");

  const isSenhaOk = await comparePassword(senha, usuarioObj.senha);
  if (!isSenhaOk) throw new Error("Invalid password");

  return getAuthResponse(usuarioObj);
};

exports.register = async (req, res) => {
  const { email, senha, isEmpresa } = req.body;
  if (!senha) throw new Error("Password not informed");
  const hashSenha = await encryptPassword(senha);
  const data = {
    _id: id6(),
    email,
    senha: hashSenha,
    plano: isEmpresa ? USUARIO_PLANOS.PJ_FREE : USUARIO_PLANOS.PF_FREE,
  };

  const usuarioObj = await UsuarioModel.create(data);
  if (!usuarioObj) throw new Error("Failed to create user");

  return getAuthResponse(usuarioObj);
};

exports.updatePlano = async (req, res) => {
  const { id, plano } = req.body;

  if (!Object.values(USUARIO_PLANOS).includes(plano)) {
    throw new Error(`Invalid plano "${plano}"`);
  }

  const usuarioObj = await UsuarioModel.findByIdAndUpdate(
    id,
    { plano },
    { new: true }
  );
  if (!usuarioObj) throw new Error("Failed to update user plano");

  return getAuthResponse(usuarioObj);
};

exports.getSelf = async (req, res) => {
  if (!req.usuario?._id) throw new Error("Usuario not in context jwt data");
  const usuario = await UsuarioModel.findById(req.usuario._id);
  if (!usuario) throw new Error("Usuario not found");
  const data = {
    _id: usuario._id,
    email: usuario.email,
    plano: usuario.plano,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt,
  };
  return data;
}

exports.deleteSelf = async (req, res) => {
  if (!req.usuario?._id) throw new Error("Usuario not in context jwt data");
  const usuario = await UsuarioModel.findByIdAndRemove(req.usuario._id);
  if (!usuario) throw new Error("Usuario not found");
  return {
    usuario: usuario._doc,
    deleted: true,
  };
}

exports.allUsers = async (req, res) => {
  return await UsuarioModel.find(req.query);
}