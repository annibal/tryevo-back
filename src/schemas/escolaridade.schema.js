const SchemaFactory = require("./base.schema");

const EscolaridadeSchema = SchemaFactory({
  _id: { type: String, required: true, },

  nome: { type: String },
  nivel: { type: String },
  isCompleto: { type: String },
  inicio: { type: String },
  fim: { type: String },

}, { _id: false });

module.exports = EscolaridadeSchema;