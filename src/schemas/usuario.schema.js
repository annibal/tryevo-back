const SchemaFactory = require("./base.schema");

const UsuarioSchema = SchemaFactory({
  email: { type: String, required: true },
  senha: { type: String, required: true },
});

module.exports = UsuarioSchema;