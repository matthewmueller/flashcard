/**
 * Module Dependencies
 */

var request = require('superagent'),
    regex = require('regexps'),
    template = require('./template');

/**
 * Export Flashcard
 */

module.exports = flashcard;

/**
 * Initialize Flashcard
 */

function flashcard(val) {
  cards = val.split('===');
  cards.forEach(function(card) {
    card = card.trim();
    if(!card) return;

    card.split('\n').forEach(function(line) {
      if(regex.url.test(line)) return follow(line);
    });
  });
}

function follow(url) {
  request
    .get(url)
    .end(function(res) {
      console.log(res);
    });
}
