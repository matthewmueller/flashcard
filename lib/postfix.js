/**
 * Module Dependencies
 */

var superagent = require('superagent'),
    Batch = require('batch');

/**
 * Add in the media data
 */

module.exports = function(toks, fn) {
  var batch = new Batch;

  toks.forEach(function(tok, i) {
    if('url' !== tok[0]) return;
    batch.push(function(done) {
      superagent
        .get(tok[1])
        .end(function(err, res) {
          if(err) return done(err);
          var type = res.type,
              m = type.match(/[^\/]+/);
          if(!m) m = ['link'];
          toks[i] = [m[0], tok[1]];
          done();
        });
    });
  });

  batch.end(function(err) {
    if(err) return fn(err);
    fn(null, toks);
  });
};

