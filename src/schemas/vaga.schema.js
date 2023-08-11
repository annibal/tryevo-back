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
  beneficiosOferecidos: { type: [ManySchema] },
  questoes: { type: [VagaQuestaoSchema] },

  pcd: { type: Boolean, default: false },
  disponivelViagem: { type: Boolean, default: false },
  disponivelMudanca: { type: Boolean, default: false },

  ocultarEmpresa: { type: Boolean, default: false },
  analisePsicologo: { type: Boolean, default: false },
});

module.exports = VagaSchema;
