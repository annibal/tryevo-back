const SchemaFactory = require("./base.schema");
const QualificacaoSchema = require("./qualificacao.schema");

const ExperienciaProfissionalSchema = SchemaFactory({
  _id: { type: String, required: true, },

  cargo: { type: String, required: true },
  empresa: { type: String, required: true },
  descricao: { type: String },
  inicio: { type: String, required: true },
  fim: { type: String },
  isAtual: { type: String },
  qualificacoes: { type: [ QualificacaoSchema ] },

}, { _id: false });

module.exports = ExperienciaProfissionalSchema;