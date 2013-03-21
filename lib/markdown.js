/**
 * Module Dependencies
 */

var hl = require('highlight.js'),
    marked = require('marked');

/**
 * Exports
 */

module.exports = function(md) {
  return marked(md);
};

/**
 * Mappings between marked and highlight.js
 */

var language = {
  'js' : 'javascript',
  'html' : 'xml',
  'shell' : 'bash'
};

/**
 * Marked settings
 */

marked.setOptions({
  gfm : true,
  sanitize : true,
  langPrefix : 'lang ',
  highlight: function(code, lang) {
    if(!lang || lang == 'raw') return code;

    // differences between marked and highlight.js
    lang = (language[lang]) ? language[lang] : lang;

    // Let's not let syntax highlighting kill anything
    try {
      return hl.highlight(lang, code).value;
    } catch(e) {
      console.error(lang, e);
      return code;
    }
  }
});
