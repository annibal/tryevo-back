const SchemaFactory = require("./base.schema");
const ManySchema = require("./many.schema");
const EnderecoSchema = require("./endereco.schema");

const PJSchema = SchemaFactory({
  nomeResponsavel: { type: String, required: true },
  razaoSocial: { type: String },
  nomeFantasia: { type: String },

  endereco: { type: EnderecoSchema },
  
  telefones: { type: [ ManySchema ] },
  links: { type: [ ManySchema ] },
  
  cnpj: { type: String, minlength: 14 },
  inscricaoEstadual: { type: String, minlength: 8 },

  qtdFuncionarios: { type: Number },
  faturamentoAnual: { type: Number },
});

module.exports = PJSchema;