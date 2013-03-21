/**
 * Module Dependencies
 */

var port = process.argv[2] || 9000,
    express = require('express'),
    app = module.exports = express();

var compiler = require('./lib/compiler');

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

app.post('/notes', function(req, res, next) {
  var notes = req.body.notes;

  compiler(notes, function(err, html) {
    if(err) return next(err);
    res.send(html);
  })
});

/**
 * Listen
 */

if(!module.parent) {
  app.listen(port);
  console.log('Server started on port', port);
}
