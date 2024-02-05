const SchemaFactory = require("./base.schema");

const UsuarioSchema = SchemaFactory({
  gateway_id: { type: String },
  subscription_id: { type: String },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true, minlength: 6 },
  plano: { type: String, required: true },
  resetId: { type: String },
  resetMaxDate: { type: Date },
});

module.exports = UsuarioSchema;
