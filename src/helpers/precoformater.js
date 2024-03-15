module.exports = function precoPag(floatValue) {
  const fixed = (+floatValue).toFixed(2);
  const multipliedValue = fixed * 100;
  const intValue = Math.floor(multipliedValue);

  return intValue;
}
