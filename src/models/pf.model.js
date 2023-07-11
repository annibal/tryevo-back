const mongoose = require("mongoose");

const PFSchema = new mongoose.Schema({
  _id: { type: String, required: true, },

  usuario: { type: String, required: true, },
  
  firstName: { type: String },
  lastName: { type: String },
  displayName: { type: String },
  gender: { type: String },
  maritalStatus: { type: String },
  nacionalidade: { type: String },
  birthDate: { type: String },
  mainPhone: { type: String },
  mainPhoneType: { type: String },
  phone: { type: String },
  phoneType: { type: String },
  cpf: { type: String },
  rg: { type: String },
  passport: { type: String },
  cnhCategory: { type: String },
  cnh: { type: String },
  socialNetwork: { type: String },
  socialNetworkType: { type: String },
  disability: { type: String },
  travelAvailableDistance: { type: String },
  changeAvailableDistance: { type: String },

  linguagem: { type: String },
  linguagemType: { type: String },

  project: { type: String },
  projectLink: { type: String },
  projectDescription: { type: String },
  projectDate: { type: String },

  professionalExperience: { type: String },
  professionalExperienceDescription: { type: String },
  professionalExperiencePosition: { type: String },
  professionalExperienceCurrentJob: { type: String },
  professionalExperienceStartDate: { type: String },
  professionalExperienceEndDate: { type: String },

  schoolLevel: { type: String },
  schoolLevelComplete: { type: String },
  schoolStartDate: { type: String },
  schoolEndDate: { type: String },
  schoolName: { type: String },

}, { _id: false });

const PF = mongoose.model("PF", PFSchema);

module.exports = PF;