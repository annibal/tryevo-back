const SchemaFactory = require("./base.schema");
const ManySchema = require("./many.schema");
const ProjetosPessoaisSchema = require("./projetos-pessoais.schema");
const EscolaridadeSchema = require("./escolaridade.schema");
const ExperienciaProfissionalSchema = require("./experiencia-profissional.schema");
const EnderecoSchema = require("./endereco.schema");
const QualificacaoSchema = require("./qualificacao.schema");

const PFSchema = SchemaFactory({
  _id: { type: String, required: true, },

  nomePrimeiro: { type: String },
  nomeUltimo: { type: String },
  nomePreferido: { type: String },
  genero: { type: String },
  estadoCivil: { type: String },
  nacionalidade: { type: String },
  nascimento: { type: Date },
  
  telefones: { type: [ ManySchema ] },
  links: { type: [ ManySchema ] },
  documentos: { type: [ ManySchema ] },
  enderecos: { type: [ EnderecoSchema ] },
  qualificacoes: { type: [ QualificacaoSchema ] },
  
  linguagens: { type: [ ManySchema ] },
  projetosPessoais: { type: [ ProjetosPessoaisSchema ] },
  escolaridade: { type: [ EscolaridadeSchema ] },
  experienciaProfissional: { type: [ ExperienciaProfissionalSchema ] },
  
  isAleijado: { type: Boolean, default: false },
  aceitaTrabalharDistancia: { type: Number, default: 0, },
  aceitaMudarDistancia: { type: Number, default: 0, },
  isPsiquiatra: { type: Boolean, default: false }

}, { _id: false });

module.exports = PFSchema;