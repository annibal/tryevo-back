module.exports = function formatTelefone(val) {
  if (val == null) return "";
  if (typeof val === "number") val = `${val}`;
  if (val.length < 8) return val;
  if (val.length === 8) return `${val.slice(0, 4)}-${val.slice(4)}`;
  if (val.length === 9) return `${val.slice(0, 5)}-${val.slice(5)}`;
  if (val.length === 10)
    return `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`;
  if (val.length === 11)
    return `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
  return val;
};
