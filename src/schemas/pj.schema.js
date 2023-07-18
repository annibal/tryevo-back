const SchemaFactory = require("./base.schema");
const ManySchema = require("./many.schema");
const EnderecoSchema = require("./endereco.schema");

const PJSchema = SchemaFactory({
  nomeResponsavel: { type: String, required: true },
  razaoSocial: { type: String },
  nomeFantasia: { type: String },
  
  telefones: { type: [ ManySchema ] },
  links: { type: [ ManySchema ] },
  documentos: { type: [ ManySchema ] },
  enderecos: { type: [ EnderecoSchema ] },

});

module.exports = PJSchema;