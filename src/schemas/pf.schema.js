const SchemaFactory = require("./base.schema");
const ManySchema = require("./many.schema");
const ProjetosPessoaisSchema = require("./projetos-pessoais.schema");
const EscolaridadeSchema = require("./escolaridade.schema");
const ExperienciaProfissionalSchema = require("./experiencia-profissional.schema");
const EnderecoSchema = require("./endereco.schema");
const { TIPO_GENERO, TIPO_ESTADO_CIVIL, TIPO_CNH } = require("./enums");

const PFSchema = SchemaFactory({
  nomePrimeiro: { type: String, required: true, minlength: 3, },
  nomeUltimo: { type: String },
  nomePreferido: { type: String },
  genero: { type: String, required: true, enum: Object.values(TIPO_GENERO), },
  estadoCivil: { type: String, enum: Object.values(TIPO_ESTADO_CIVIL), },
  nacionalidade: { type: String },
  nascimento: { type: Date, required: true },
  categoriaCNH: { type: String, required: true, enum: Object.values(TIPO_CNH), default: TIPO_CNH.NONE },
  
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
  escolaridades: { type: [ EscolaridadeSchema ] },
  experienciasProfissionais: { type: [ ExperienciaProfissionalSchema ] },

  vagasSalvas: { type: [ String ] },
});

module.exports = PFSchema;