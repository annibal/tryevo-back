const SchemaFactory = require("./base.schema");
const { USUARIO_PLANOS } = require("./enums");

const UsuarioSchema = SchemaFactory({
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true, minlength: 6 },
  plano: { type: String, required: true, enum: Object.values(USUARIO_PLANOS), default: USUARIO_PLANOS.PF_FREE },
  resetId: { type: String },
  resetMaxDate: { type: Date },
});

module.exports = UsuarioSchema;