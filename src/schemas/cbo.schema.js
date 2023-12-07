const mongoose = require("mongoose");

const CboSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    nome: { type: String, required: true },
    codigo: { type: String },
    valid: { type: Boolean, default: false },
  },
  { _id: false }
);

module.exports = CboSchema;
