function parseDMYdate(strDate) {
  if (strDate.length === 10) {
    const dmy = strDate.split('/')
    if (dmy.length === 3 && dmy[1].length === 2 && dmy[2].length === 4) {
      return dmy.reverse().join('-');
    }
  }
  return strDate;
}

module.exports = parseDMYdate