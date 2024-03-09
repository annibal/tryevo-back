module.exports = function precoPag(floatValue) {
  const multipliedValue = floatValue * 100;
  const intValue = Math.floor(multipliedValue);

  return intValue;
}
