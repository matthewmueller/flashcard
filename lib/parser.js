/**
 * Parser
 */

module.exports = function(toks) {
  var out = [];

  while(toks.length) {
    if(is('text')) text();
    else out.push(next());
  }

  return out;

  /**
   * Check if the next token is `type`.
   */

  function is(type) {
    if (type == toks[0][0]) return true;
  }

  /**
   * Grab the next token.
   */

  function next() {
    return toks.shift();
  }

  /**
   * text
   */

  function text() {
    var textblock = []

    while(is('text')) {
      textblock.push(next());
    }

    out.push([ 'block', textblock ]);
  }
}


