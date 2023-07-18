const SchemaFactory = require("./base.schema");
const VagaQuestaoSchema = require("./vaga-questao.schema");

const PropostaSchema = SchemaFactory({
  _id: { type: String, required: true },

  vaga: { type: String, required: true },
  usuario: { type: String, required: true },
  respostas: { type: [ VagaQuestaoSchema ] },
  
}, { _id: false });

module.exports = PropostaSchema;