/**
 * Module Dependencies
 */

var fs = require('fs'),
    read = fs.readFileSync,
    write = fs.writeFileSync,
    parser = require('../lib/parser');
    compile = require('../lib/compiler'),
    beautify = require('js-beautify').html;

var note = read(__dirname + '/cases/note.txt', 'utf8');

compile(note, function(err, str) {
  if(err) throw err;
  write(__dirname + '/cases/note.html', str);
});
