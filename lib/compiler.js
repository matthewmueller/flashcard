/**
 * Module Dependencies
 */

var scan = require('./lexer'),
    fix = require('./postfix'),
    parse = require('./parser'),
    beautify = require('js-beautify').html,
    markdown = require('./markdown');

/**
 * Export
 */

module.exports = function(str, fn) {
  var toks = scan(str);
  fix(toks, function(err, toks) {
    if(err) return fn(err);
    var ast = parse(toks);
    fn && fn(null, compile(ast));
  });
};


function compile(ast) {
  var out = [];

  ast.forEach(function(node, i) {
    var type = node[0];
    if('card' === type) return out.push(card(i));
    if('flip' === type) return out.push(flip());
    if('block' === type) return out.push(textblock(node[1]));
    if('link' === type) return out.push(link(node[1]));
    if('image' === type) return out.push(image(node[1]));
    if('audio' === type) return out.push(audio(node[1]));
    if('youtube' === type) return out.push(youtube(node[1]));
    if('eof' === type) return out.push(eof());
  });

  return beautify(out.join(''), { indent_size : 2});
};

/**
 * new card
 */

function card(n) {
  var card = '<div class="card"><div class="front">';
  if(n === 0) return card;
  else return '</div></div>' + card;
}

/**
 * card flip
 */

function flip() {
  return '</div><div class="back">';
}

/**
 * eof
 */

function eof() {
  return '</div></div>';
}

/**
 * textblock
 */

function textblock(textblock) {
  var str = textblock.map(function(text) {
    return text[1];
  }).join('').trim();

  return '<div class="text">' + markdown(str) + '</div>';
}

/**
 * link
 */

function link(href) {
  return '<a href="' + href + '">' + href + '</a>';
}

/**
 * image
 */

function image(src) {
  return '<img src="' + src + '">';
}

/**
 * audio
 */

function audio(url) {
  return '<audio src="' + url + '"></audio>';
}

/**
 * youtube
 */

function youtube(vid) {
  return '<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/' + vid + '" allowfullscreen frameborder="0"></iframe>';
};
