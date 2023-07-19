const slugify = require("slugify");

module.exports = function strToSlug(str) {
  return slugify(str, {
    replacement: "-",
    lower: true,
    trim: true,
  });
};
