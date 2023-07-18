const SchemaFactory = require("./base.schema");
const VagaQuestaoSchema = require("./vaga-questao.schema");

const VagaSchema = SchemaFactory({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  qualificacoes: { type: [ String ] },
  questoes: { type: [ VagaQuestaoSchema ] },
});

module.exports = VagaSchema;