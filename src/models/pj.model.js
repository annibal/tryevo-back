const mongoose = require("mongoose");

const PJSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  usuario: {
    type: String,
    required: true,
  },
  razaoSocial: {
    type: String,
    required: true,
  },
  nomeFantasia: {
    type: String,
    required: true,
  },
  cnpj: {
    type: String,
    required: true,
  },
  mainPhone: {
    type: String,
    required: true,
  },
  mainPhoneType: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  phoneType: {
    type: String,
    required: true,
  },
  socialNetwork: {
    type: String,
    required: true,
  },
  socialNetworkType: {
    type: String,
    required: true,
  },
}, { _id: false });

const PJ = mongoose.model("PJ", PJSchema);

module.exports = PJ;