const SchemaFactory = require("./base.schema");
const EnderecoSchema = require("./endereco.schema");
const {
  TIPO_GENERO,
  TIPO_CNH,
  TIPO_ESCOLARIDADE,
  TIPO_CONTRATO,
  TIPO_MODELO_CONTRATO,
  TIPO_JORNADA,
} = require("./enums");
const ManySchema = require("./many.schema");
const VagaQuestaoSchema = require("./vaga-questao.schema");

const VagaSchema = SchemaFactory({
  active: { type: Boolean },
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  apelido: { type: String },

  cargo: { type: String },
  experiencia: { type: Number },
  salarioMinimo: { type: Number },
  salarioMaximo: { type: Number },
  idadeMinima: { type: Number },
  idadeMaxima: { type: Number },
  diasPresencial: { type: Number },
  endereco: { type: EnderecoSchema },

  tipoContrato: { type: String, enum: Object.values(TIPO_CONTRATO) },
  modeloContrato: { type: String, enum: Object.values(TIPO_MODELO_CONTRATO) },
  jornada: { type: String, enum: Object.values(TIPO_JORNADA) },

  testes: { type: [String] },
  qualificacoes: { type: [String] },
  habilidades: { type: [String] },

  categoriaCNH: { type: String, enum: Object.values(TIPO_CNH) },
  escolaridade: { type: String, enum: Object.values(TIPO_ESCOLARIDADE) },
  genero: { type: String, enum: Object.values(TIPO_GENERO) },
  linguagens: { type: [ManySchema] },
  beneficiosOferecidos: {
    type: [
      {
        nome: { type: String, required: true },
        valor: { type: String },
      },
    ],
  },
  questoes: { type: [VagaQuestaoSchema] },

  pcd: { type: Boolean, default: false },
  disponivelViagem: { type: Boolean, default: false },
  disponivelMudanca: { type: Boolean, default: false },

  ocultarEmpresa: { type: Boolean, default: false },
  analisePsicologo: { type: Boolean, default: false },

  integrarLinkedin: { type: Boolean, default: false },
  integrarLinkedinConfig: { type: String },
  integrarCatho: { type: Boolean, default: false },
  integrarCathoConfig: { type: String },
  integrarCurriculos: { type: Boolean, default: false },
  integrarCurriculosConfig: { type: String },
  integrarInfojobs: { type: Boolean, default: false },
  integrarInfojobsConfig: { type: String },
});

module.exports = VagaSchema;
