const SchemaFactory = require("./base.schema");

const EnderecoSchema = SchemaFactory({
  _id: { type: String, required: true, },
  
  cep: { type: String, required: true },
  pais: { type: String, required: true },
  estado: { type: String, required: true },
  cidade: { type: String, required: true },
  bairro: { type: String, required: true },
  rua: { type: String, required: true },
  numero: { type: String, required: true },
  complemento: { type: String },

  lat: { type: Number },
  lng: { type: Number },
  isPrincipal: { type: Boolean, default: false },

}, { _id: false });

module.exports = EnderecoSchema;







