/**
 * Regexps
 */

var rurl = /^((?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?)\n/i;

/**
 * Scan the given `str` returning tokens.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

module.exports = function(str) {
  // left trim
  str = str.replace(/^\n*/, '');
  return scan();

  /**
   * scanner
   */

  function scan() {
    var toks = [],
        curr;

    while(str.length) {
      curr = next();
      curr && toks.push(curr);
      if (str.length && !curr) {
        throw new Error('syntax error near "' + str.slice(0, 10) + '"');
      }
    }

    // place card at front if there isn't one already
    if(toks[0][0] !== 'card') {
      toks.unshift(['card']);
    }

    // remove empty last card
    if(toks[toks.length - 1][0] === 'card') toks.pop();

    // add eof token
    toks.push(['eof']);
    return toks;
  }

  /**
   *   eos
   * | indentation
   * | rule
   */

  function next() {
    return url()
      || flip()
      || card()
      || text()
  }

  /**
   * Url token
   */

  function url() {
    var m = str.match(rurl);
    if(!m) return;
    str = str.slice(m[0].length);
    return ['url', m[1]];
  }

  /**
   * Flip card
   */

  function flip() {
    var m = str.match(/^-{2,}\n/);
    if(!m) return;
    str = str.slice(m[0].length);
    return ['flip'];
  }

  /**
   * Next card
   */

  function card() {
    var m = str.match(/^={2,}\n/)
    if(!m) return;
    str = str.slice(m[0].length);
    return ['card'];
  }

  /**
   * Text token
   */

  function text() {
    var m = str.match(/^([^\n]*)\n/)
    if(!m) return;
    str = str.slice(m[0].length);
    return ['text', m[0]];
  }

};
