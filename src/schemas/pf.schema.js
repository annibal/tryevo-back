const SchemaFactory = require("./base.schema");
const ManySchema = require("./many.schema");
const ProjetosPessoaisSchema = require("./projetos-pessoais.schema");
const EscolaridadeSchema = require("./escolaridade.schema");
const ExperienciaProfissionalSchema = require("./experiencia-profissional.schema");
const EnderecoSchema = require("./endereco.schema");
const {
  TIPO_GENERO,
  TIPO_ESTADO_CIVIL,
  TIPO_CNH,
  TIPO_CONTRATO,
  TIPO_MODELO_CONTRATO,
  TIPO_JORNADA,
} = require("./enums");

const PFSchema = SchemaFactory({
  nomePrimeiro: { type: String, required: true, minlength: 3 },
  nomeUltimo: { type: String },
  nomePreferido: { type: String },
  resumo: { type: String },
  genero: { type: String, required: true, enum: Object.values(TIPO_GENERO) },
  estadoCivil: { type: String, enum: Object.values(TIPO_ESTADO_CIVIL) },
  nacionalidade: { type: String },
  nascimento: { type: Date, required: true },

  endereco: { type: EnderecoSchema },

  pcd: { type: Boolean, default: false },
  pcdDescrição: { type: String },
  aceitaTrabalharDistancia: { type: Number, default: 0 },
  aceitaMudarDistancia: { type: Number, default: 0 },

  telefones: { type: [ManySchema] },
  links: { type: [ManySchema] },
  
  cpf: { type: String, minlength: 11 },
  rg: { type: String, minlength: 9 },
  passaporte: { type: String, minlength: 8 },
  cnh: { type: String, minlength: 11 },
  categoriaCNH: {
    type: String,
    required: true,
    enum: Object.values(TIPO_CNH),
    default: TIPO_CNH.NONE,
  },

  // qualificacoes: { type: [String] }, // aka Competencias
  habilidades: { type: [String] },

  objetivos: {
    type: [
      {
        cargo: { type: String, required: true },
        remuneracao: { type: Number, required: true },
        tipoContrato: { type: String, enum: Object.values(TIPO_CONTRATO), required: true },
        modeloContrato: { type: String, enum: Object.values(TIPO_MODELO_CONTRATO), required: true },
        jornada: { type: String, enum: Object.values(TIPO_JORNADA), required: true },
      },
    ],
  },

  linguagens: { type: [ManySchema] },
  projetosPessoais: { type: [ProjetosPessoaisSchema] },
  cursos: { type: [{
    titulo: { type: String, required: true },
    descricao: { type: String },
    nomeEscola: { type: String },
    inicio: { type: Date },
    isCursando: { type: Boolean },
    cargaHoraria: { type: Number },
    hasDiploma: { type: Boolean },
  }] },
  escolaridades: { type: [EscolaridadeSchema] },
  experienciasProfissionais: { type: [ExperienciaProfissionalSchema] },

  vagasSalvas: { type: [String] },
});

module.exports = PFSchema;
