const SchemaFactory = require("./base.schema");

const EscolaridadeSchema = SchemaFactory({
  nome: { type: String },
  nivel: { type: String },
  isCompleto: { type: String },
  inicio: { type: String },
  fim: { type: String },
});

module.exports = EscolaridadeSchema;