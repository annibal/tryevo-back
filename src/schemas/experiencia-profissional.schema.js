const SchemaFactory = require("./base.schema");

const ExperienciaProfissionalSchema = SchemaFactory({
  cargo: { type: String, required: true },
  empresa: { type: String, required: true },
  descricao: { type: String },
  inicio: { type: String, required: true },
  fim: { type: String },
  isAtual: { type: String },
  qualificacoes: { type: [ String ] },
});

module.exports = ExperienciaProfissionalSchema;