const SchemaFactory = require("./base.schema");
const ManySchema = require("./many.schema");
const ProjetosPessoaisSchema = require("./projetos-pessoais.schema");
const EscolaridadeSchema = require("./escolaridade.schema");
const ExperienciaProfissionalSchema = require("./experiencia-profissional.schema");
const EnderecoSchema = require("./endereco.schema");

const PFSchema = SchemaFactory({
  nomePrimeiro: { type: String },
  nomeUltimo: { type: String },
  nomePreferido: { type: String },
  genero: { type: String },
  estadoCivil: { type: String },
  nacionalidade: { type: String },
  nascimento: { type: Date },
  
  endereco: { type: EnderecoSchema },
  
  isAleijado: { type: Boolean, default: false },
  aceitaTrabalharDistancia: { type: Number, default: 0, },
  aceitaMudarDistancia: { type: Number, default: 0, },
  isPsiquiatra: { type: Boolean, default: false },

  telefones: { type: [ ManySchema ] },
  links: { type: [ ManySchema ] },
  documentos: { type: [ ManySchema ] },
  qualificacoes: { type: [ String ] },
  
  linguagens: { type: [ ManySchema ] },
  projetosPessoais: { type: [ ProjetosPessoaisSchema ] },
  escolaridade: { type: [ EscolaridadeSchema ] },
  experienciaProfissional: { type: [ ExperienciaProfissionalSchema ] },
});

module.exports = PFSchema;