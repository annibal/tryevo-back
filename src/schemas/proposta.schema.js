const SchemaFactory = require("./base.schema");

// a.k.a. CandidaturaSchema
const PropostaSchema = SchemaFactory({
  vagaId: { type: String, required: true },
  candidatoId: { type: String, required: true },
  
  questoes: {
    type: [
      {
        pergunta: { type: String, required: true },
        resposta: { type: String },
      },
    ],
    required: true,
  },

  viuDados: { type: Boolean, default: false },
  contratou: { type: Boolean, default: false },
});

module.exports = PropostaSchema;
