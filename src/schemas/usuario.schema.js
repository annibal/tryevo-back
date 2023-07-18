const SchemaFactory = require("./base.schema");

const UsuarioSchema = SchemaFactory({
  _id: { type: String, required: true },

  email: { type: String, required: true },
  senha: { type: String, required: true },
  
}, { _id: false });

module.exports = UsuarioSchema;