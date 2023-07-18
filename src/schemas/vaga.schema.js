const SchemaFactory = require("./base.schema");
const VagaQuestaoSchema = require("./vaga-questao.schema");
const QualificacaoSchema = require("./qualificacao.schema");

const VagaSchema = SchemaFactory({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  qualificacoes: { type: [ QualificacaoSchema ] },
  questoes: { type: [ VagaQuestaoSchema ] },
});

module.exports = VagaSchema;