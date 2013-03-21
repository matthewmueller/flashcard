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
          if(err) {
            toks[i] = ['text', tok[1]];
            return done();
          }

          var type = res.type,
              m = type.match(/[^\/]+/);

          if(!m || 'text' === m[0]) m = ['link'];

          // get the final url (redirects and all)
          var url = res.redirects.pop() || tok[1];
          toks[i] = [m[0], url];
          done();
        });
    });
  });

  batch.end(function(err) {
    if(err) return fn(err);
    fn(null, toks);
  });
};

