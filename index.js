/**
 * Module Dependencies
 */

var port = process.argv[2] || 9000,
    express = require('express'),
    superagent = require('superagent'),
    Batch = require('batch'),
    app = module.exports = express();

/**
 * URL regex
 */

var url = /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i;
var image = /^image\//;
var audio = /^audio\//;

/**
 * Configuration
 */

app.use(express.bodyParser());
app.use(express.static('./test'));
app.use(express.static('./build'));

/**
 * Routes
 */

app.get('/', function(req, res) {
  res.sendfile('./test/index.html');
});

app.post('/notes', function(req, res) {
  var notes = req.body.notes;

  notes = parse(notes, function(err, cards) {
    if(err) return next(err);
    res.send(notes)
  });

});

/**
 * Parse
 */

function parse(str, fn) {
  var lines = str.split('\n');
      batch = new Batch;

  lines.forEach(function(line, i) {
    batch.push(function(done) {
      parseLine(line, function(err, l) {
        if(err) return done(err);
        lines[i] = l || line;
        done();
      });
    });
  });

  batch.end(function(err) {
    if(err) return fn(err);
    console.log(lines);
    fn(null, lines.join('\n'));
  });
}

function parseLine(line, fn) {
  if(!url.test(line)) return fn();
  superagent
    .get(line)
    .end(function(err, res) {
      if(err) return fn(err);
      var type = res.type;

      switch(parseType(res.type)) {
        case 'image':
          line = '<img src="' + line + '" />';
          break;
        case 'audio':
          line = '<audio src="' + line + '" />';
          break;
      }

      fn(null, line);
    });
};

function parseType(type) {
  if(/^image/.test(type)) return 'image';
  else if(/^audio/.test(type)) return 'audio';
};

/**
 * Listen
 */

if(!module.parent) {
  app.listen(port);
  console.log('Server started on port', port);
}
