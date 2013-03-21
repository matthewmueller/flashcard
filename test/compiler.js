/**
 * Module Dependencies
 */

var read = require('fs').readFileSync,
    parser = require('../lib/parser');
    compile = require('../lib/compiler'),
    beautify = require('js-beautify').html;

var note = read(__dirname + '/cases/note.txt', 'utf8');

compile(note, function(err, str) {
  if(err) throw err;
  var out = beautify(str, { indent_size : 2 })
  console.log(out);
});
