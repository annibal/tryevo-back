const SchemaFactory = require("./base.schema");

const QualificacaoSchema = SchemaFactory({
  nome: { type: String, required: true },
  descricao: { type: String },
  pai: { type: String },
});

module.exports = QualificacaoSchema;