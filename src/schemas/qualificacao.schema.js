const SchemaFactory = require("./base.schema");

const QualificacaoSchema = SchemaFactory({
  _id: { type: String, required: true },
  
  nome: { type: String, required: true },
  descricao: { type: String },
  pai: { type: String },
  
}, { _id: false });

module.exports = QualificacaoSchema;