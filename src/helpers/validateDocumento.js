const { TIPO_DOCUMENTO } = require("../schemas/enums");

const validateDocumento = (doc, tipo) => {
  if (tipo === TIPO_DOCUMENTO.CNH) {
    if (doc.length < 6) return false;
    return true;
  }
  if (tipo === TIPO_DOCUMENTO.CNPJ) {
    if (doc.length < 14) return false;
    return true;
  }
  if (tipo === TIPO_DOCUMENTO.CPF) {
    if (doc.length < 11) return false;
    return true;
  }
  if (tipo === TIPO_DOCUMENTO.PASSAPORTE) {
    if (doc.length < 1) return false;
    return true;
  }
  if (tipo === TIPO_DOCUMENTO.RG) {
    if (doc.length < 9) return false;
    return true;
  }
  if (tipo === TIPO_DOCUMENTO.INSCRICAO_ESTADUAL) {
    if (doc.length < 1) return false;
    return true;
  }

  return false;
}

module.exports = validateDocumento;