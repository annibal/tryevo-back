const slugify = require("slugify");

function getMatchWords(str) {
  const sluggedDesc = slugify(str, {
    replacement: ' ',
    lower: true,
    strict: true,
    trim: true
  })

  const words = sluggedDesc.split(' ').filter(word => word.length > 3);
  const uniqueWords = Array.from(new Set(words)).sort();

  return uniqueWords.join(' ');
}

module.exports = getMatchWords