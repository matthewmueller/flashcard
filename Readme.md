# Flashcard

Hacker-friendly flashcard compiler.

## Motivation

Flashcards take too long to make. A lot of the process can be automated. Let's create a language around flashcard creation thats easy to read, open, flexible and supports lots of different kinds of media.

## But... why?

I'm learning spanish right now. I'm trying to be systematic about it:

- Start with a list of 1,000 or so most commonly used conversational words (http://en.wiktionary.org/wiki/Wiktionary:Frequency_lists)
- Learn spanish words by associating them to the image they represent, rather than the english translation. (http://www.towerofbabelfish.com/Tower_of_Babelfish/The_Method.html)
- Use audio to master pronuncian

## Design

I wanted a flexible way to slurp in a lot of the web's media with very little prior information. I decided that urls to resources was the easiest way to do this. However, many times you cannot eke out the type of media just from the url (e.g. google's speech api).

So this compiler visits each url supplied and uses the response's `content-type` to determine how to represent each url. No, this compiler is not meant to be fast.

The goal of the language is to make it very easy to write automated scripts to generate great flash cards.

## Installation

    npm install flashcard

## Usage

```js
var flashcard = require('flashcard');
flashcard('hola---hello');
```

## Language

### `===`

Represents the end of one card, the start of the next

### `---`

"Flips" the card. The back side of the card.

### `url`

URL to a media resource. Flashcard currently supports: images, audio, youtube, and regular links to html pages.

### `text`

Text is anything that isn't a url. Flashcard this text to markdown and supports code blocks.

> Empty lines don't matter except when you're in a text block (ie. in between paragraphs)


## Example

```
hola
http://fc04.deviantart.net/fs39/i/2008/363/6/4/Wave_Hello_by_8darkened8eclipse8.jpg
http://translate.google.com/translate_tts?q=hola&tl=es
---
hello
http://translate.google.com/translate_tts?q=hello&tl=en
===
gracias
http://us.123rf.com/400wm/400/400/yeyen123rf/yeyen123rf1210/yeyen123rf121000262/15840661-thank-you-blackboard-sign-thank-you-written-with-chalk-on-black-chalkboard.jpg
http://translate.google.com/translate_tts?q=gracias&tl=es
---
thank you
http://translate.google.com/translate_tts?q=thank%20you&tl=en
===
```

Compiles to:

```html
<div class="card">
  <div class="front">
    <div class="text">
      <p>hola</p>
    </div>
    <img src="http://fc04.deviantart.net/fs39/i/2008/363/6/4/Wave_Hello_by_8darkened8eclipse8.jpg">
    <audio src="http://translate.google.com/translate_tts?q=hola&tl=es"></audio>
  </div>
  <div class="back">
    <div class="text">
      <p>hello</p>
    </div>
    <audio src="http://translate.google.com/translate_tts?q=hello&tl=en"></audio>
  </div>
</div>
<div class="card">
  <div class="front">
    <div class="text">
      <p>gracias</p>
    </div>
    <img src="http://us.123rf.com/400wm/400/400/yeyen123rf/yeyen123rf1210/yeyen123rf121000262/15840661-thank-you-blackboard-sign-thank-you-written-with-chalk-on-black-chalkboard.jpg">
    <audio src="http://translate.google.com/translate_tts?q=gracias&tl=es"></audio>
  </div>
  <div class="back">
    <div class="text">
      <p>thank you</p>
    </div>
    <audio src="http://translate.google.com/translate_tts?q=thank%20you&tl=en"></audio>
  </div>
</div>
```

## Special Thanks

This was my first attempt at building a DSL. TJ's https://github.com/visionmedia/css-whitespace was really helpful.

