module.exports = function precoPagBank(number) {
  if (!number) return "";
  return number.toFixed(2).replace(".","");
}