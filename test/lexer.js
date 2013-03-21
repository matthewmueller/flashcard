/**
 * Module Dependencies
 */

var read = require('fs').readFileSync,
    parser = require('../lib/parser');
    compile = require('../lib/compiler'),
    util = require('util');

var note = read('./cases/note.txt', 'utf8');

compile(note, function(err, str) {
  if(err) throw err;

  var tidy = require('htmltidy').tidy;
  console.log(str);

  tidy(str, function(err, out) {
    if(err) console.log(err);
    console.log(out);
  });
});
