const SchemaFactory = require("./base.schema");
const VagaQuestaoSchema = require("./vaga-questao.schema");

const PropostaSchema = SchemaFactory({
  vaga: { type: String, required: true },
  usuario: { type: String, required: true },
  respostas: { type: [ VagaQuestaoSchema ] },
});

module.exports = PropostaSchema;