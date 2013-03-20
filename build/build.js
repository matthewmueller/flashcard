

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", Function("exports, require, module",
"\nvar indexOf = [].indexOf;\n\nmodule.exports = function(arr, obj){\n  if (indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Expose `Emitter`.\n */\n\nmodule.exports = Emitter;\n\n/**\n * Initialize a new `Emitter`.\n *\n * @api public\n */\n\nfunction Emitter(obj) {\n  if (obj) return mixin(obj);\n};\n\n/**\n * Mixin the emitter properties.\n *\n * @param {Object} obj\n * @return {Object}\n * @api private\n */\n\nfunction mixin(obj) {\n  for (var key in Emitter.prototype) {\n    obj[key] = Emitter.prototype[key];\n  }\n  return obj;\n}\n\n/**\n * Listen on the given `event` with `fn`.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.on = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  (this._callbacks[event] = this._callbacks[event] || [])\n    .push(fn);\n  return this;\n};\n\n/**\n * Adds an `event` listener that will be invoked a single\n * time then automatically removed.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.once = function(event, fn){\n  var self = this;\n  this._callbacks = this._callbacks || {};\n\n  function on() {\n    self.off(event, on);\n    fn.apply(this, arguments);\n  }\n\n  fn._off = on;\n  this.on(event, on);\n  return this;\n};\n\n/**\n * Remove the given callback for `event` or all\n * registered callbacks.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.off =\nEmitter.prototype.removeListener =\nEmitter.prototype.removeAllListeners = function(event, fn){\n  this._callbacks = this._callbacks || {};\n\n  // all\n  if (0 == arguments.length) {\n    this._callbacks = {};\n    return this;\n  }\n\n  // specific event\n  var callbacks = this._callbacks[event];\n  if (!callbacks) return this;\n\n  // remove all handlers\n  if (1 == arguments.length) {\n    delete this._callbacks[event];\n    return this;\n  }\n\n  // remove specific handler\n  var i = index(callbacks, fn._off || fn);\n  if (~i) callbacks.splice(i, 1);\n  return this;\n};\n\n/**\n * Emit `event` with the given args.\n *\n * @param {String} event\n * @param {Mixed} ...\n * @return {Emitter}\n */\n\nEmitter.prototype.emit = function(event){\n  this._callbacks = this._callbacks || {};\n  var args = [].slice.call(arguments, 1)\n    , callbacks = this._callbacks[event];\n\n  if (callbacks) {\n    callbacks = callbacks.slice(0);\n    for (var i = 0, len = callbacks.length; i < len; ++i) {\n      callbacks[i].apply(this, args);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Return array of callbacks for `event`.\n *\n * @param {String} event\n * @return {Array}\n * @api public\n */\n\nEmitter.prototype.listeners = function(event){\n  this._callbacks = this._callbacks || {};\n  return this._callbacks[event] || [];\n};\n\n/**\n * Check if this emitter has `event` handlers.\n *\n * @param {String} event\n * @return {Boolean}\n * @api public\n */\n\nEmitter.prototype.hasListeners = function(event){\n  return !! this.listeners(event).length;\n};\n//@ sourceURL=component-emitter/index.js"
));
require.register("RedVentures-reduce/index.js", Function("exports, require, module",
"\n/**\n * Reduce `arr` with `fn`.\n *\n * @param {Array} arr\n * @param {Function} fn\n * @param {Mixed} initial\n *\n * TODO: combatible error handling?\n */\n\nmodule.exports = function(arr, fn, initial){  \n  var idx = 0;\n  var len = arr.length;\n  var curr = arguments.length == 3\n    ? initial\n    : arr[idx++];\n\n  while (idx < len) {\n    curr = fn.call(null, curr, arr[idx], ++idx, arr);\n  }\n  \n  return curr;\n};//@ sourceURL=RedVentures-reduce/index.js"
));
require.register("visionmedia-superagent/lib/client.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar Emitter = require('emitter')\n  , reduce = require('reduce');\n\n/**\n * Root reference for iframes.\n */\n\nvar root = 'undefined' == typeof window\n  ? this\n  : window;\n\n/**\n * Noop.\n */\n\nfunction noop(){};\n\n/**\n * Determine XHR.\n */\n\nfunction getXHR() {\n  if (root.XMLHttpRequest\n    && ('file:' != root.location.protocol || !root.ActiveXObject)) {\n    return new XMLHttpRequest;\n  } else {\n    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}\n    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}\n    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}\n    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}\n  }\n  return false;\n}\n\n/**\n * Removes leading and trailing whitespace, added to support IE.\n *\n * @param {String} s\n * @return {String}\n * @api private\n */\n\nvar trim = ''.trim\n  ? function(s) { return s.trim(); }\n  : function(s) { return s.replace(/(^\\s*|\\s*$)/g, ''); };\n\n/**\n * Check if `obj` is an object.\n *\n * @param {Object} obj\n * @return {Boolean}\n * @api private\n */\n\nfunction isObject(obj) {\n  return obj === Object(obj);\n}\n\n/**\n * Serialize the given `obj`.\n *\n * @param {Object} obj\n * @return {String}\n * @api private\n */\n\nfunction serialize(obj) {\n  if (!isObject(obj)) return obj;\n  var pairs = [];\n  for (var key in obj) {\n    pairs.push(encodeURIComponent(key)\n      + '=' + encodeURIComponent(obj[key]));\n  }\n  return pairs.join('&');\n}\n\n/**\n * Expose serialization method.\n */\n\n request.serializeObject = serialize;\n\n /**\n  * Parse the given x-www-form-urlencoded `str`.\n  *\n  * @param {String} str\n  * @return {Object}\n  * @api private\n  */\n\nfunction parseString(str) {\n  var obj = {};\n  var pairs = str.split('&');\n  var parts;\n  var pair;\n\n  for (var i = 0, len = pairs.length; i < len; ++i) {\n    pair = pairs[i];\n    parts = pair.split('=');\n    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);\n  }\n\n  return obj;\n}\n\n/**\n * Expose parser.\n */\n\nrequest.parseString = parseString;\n\n/**\n * Default MIME type map.\n *\n *     superagent.types.xml = 'application/xml';\n *\n */\n\nrequest.types = {\n  html: 'text/html',\n  json: 'application/json',\n  urlencoded: 'application/x-www-form-urlencoded',\n  'form': 'application/x-www-form-urlencoded',\n  'form-data': 'application/x-www-form-urlencoded'\n};\n\n/**\n * Default serialization map.\n *\n *     superagent.serialize['application/xml'] = function(obj){\n *       return 'generated xml here';\n *     };\n *\n */\n\n request.serialize = {\n   'application/x-www-form-urlencoded': serialize,\n   'application/json': JSON.stringify\n };\n\n /**\n  * Default parsers.\n  *\n  *     superagent.parse['application/xml'] = function(str){\n  *       return { object parsed from str };\n  *     };\n  *\n  */\n\nrequest.parse = {\n  'application/x-www-form-urlencoded': parseString,\n  'application/json': JSON.parse\n};\n\n/**\n * Parse the given header `str` into\n * an object containing the mapped fields.\n *\n * @param {String} str\n * @return {Object}\n * @api private\n */\n\nfunction parseHeader(str) {\n  var lines = str.split(/\\r?\\n/);\n  var fields = {};\n  var index;\n  var line;\n  var field;\n  var val;\n\n  lines.pop(); // trailing CRLF\n\n  for (var i = 0, len = lines.length; i < len; ++i) {\n    line = lines[i];\n    index = line.indexOf(':');\n    field = line.slice(0, index).toLowerCase();\n    val = trim(line.slice(index + 1));\n    fields[field] = val;\n  }\n\n  return fields;\n}\n\n/**\n * Return the mime type for the given `str`.\n *\n * @param {String} str\n * @return {String}\n * @api private\n */\n\nfunction type(str){\n  return str.split(/ *; */).shift();\n};\n\n/**\n * Return header field parameters.\n *\n * @param {String} str\n * @return {Object}\n * @api private\n */\n\nfunction params(str){\n  return reduce(str.split(/ *; */), function(obj, str){\n    var parts = str.split(/ *= */)\n      , key = parts.shift()\n      , val = parts.shift();\n\n    if (key && val) obj[key] = val;\n    return obj;\n  }, {});\n};\n\n/**\n * Initialize a new `Response` with the given `xhr`.\n *\n *  - set flags (.ok, .error, etc)\n *  - parse header\n *\n * Examples:\n *\n *  Aliasing `superagent` as `request` is nice:\n *\n *      request = superagent;\n *\n *  We can use the promise-like API, or pass callbacks:\n *\n *      request.get('/').end(function(res){});\n *      request.get('/', function(res){});\n *\n *  Sending data can be chained:\n *\n *      request\n *        .post('/user')\n *        .send({ name: 'tj' })\n *        .end(function(res){});\n *\n *  Or passed to `.send()`:\n *\n *      request\n *        .post('/user')\n *        .send({ name: 'tj' }, function(res){});\n *\n *  Or passed to `.post()`:\n *\n *      request\n *        .post('/user', { name: 'tj' })\n *        .end(function(res){});\n *\n * Or further reduced to a single call for simple cases:\n *\n *      request\n *        .post('/user', { name: 'tj' }, function(res){});\n *\n * @param {XMLHTTPRequest} xhr\n * @param {Object} options\n * @api private\n */\n\nfunction Response(xhr, options) {\n  options = options || {};\n  this.xhr = xhr;\n  this.text = xhr.responseText;\n  this.setStatusProperties(xhr.status);\n  this.header = this.headers = parseHeader(xhr.getAllResponseHeaders());\n  // getAllResponseHeaders sometimes falsely returns \"\" for CORS requests, but\n  // getResponseHeader still works. so we get content-type even if getting\n  // other headers fails.\n  this.header['content-type'] = xhr.getResponseHeader('content-type');\n  this.setHeaderProperties(this.header);\n  this.body = this.parseBody(this.text);\n}\n\n/**\n * Get case-insensitive `field` value.\n *\n * @param {String} field\n * @return {String}\n * @api public\n */\n\nResponse.prototype.get = function(field){\n  return this.header[field.toLowerCase()];\n};\n\n/**\n * Set header related properties:\n *\n *   - `.type` the content type without params\n *\n * A response of \"Content-Type: text/plain; charset=utf-8\"\n * will provide you with a `.type` of \"text/plain\".\n *\n * @param {Object} header\n * @api private\n */\n\nResponse.prototype.setHeaderProperties = function(header){\n  // content-type\n  var ct = this.header['content-type'] || '';\n  this.type = type(ct);\n\n  // params\n  var obj = params(ct);\n  for (var key in obj) this[key] = obj[key];\n};\n\n/**\n * Parse the given body `str`.\n *\n * Used for auto-parsing of bodies. Parsers\n * are defined on the `superagent.parse` object.\n *\n * @param {String} str\n * @return {Mixed}\n * @api private\n */\n\nResponse.prototype.parseBody = function(str){\n  var parse = request.parse[this.type];\n  return parse\n    ? parse(str)\n    : null;\n};\n\n/**\n * Set flags such as `.ok` based on `status`.\n *\n * For example a 2xx response will give you a `.ok` of __true__\n * whereas 5xx will be __false__ and `.error` will be __true__. The\n * `.clientError` and `.serverError` are also available to be more\n * specific, and `.statusType` is the class of error ranging from 1..5\n * sometimes useful for mapping respond colors etc.\n *\n * \"sugar\" properties are also defined for common cases. Currently providing:\n *\n *   - .noContent\n *   - .badRequest\n *   - .unauthorized\n *   - .notAcceptable\n *   - .notFound\n *\n * @param {Number} status\n * @api private\n */\n\nResponse.prototype.setStatusProperties = function(status){\n  var type = status / 100 | 0;\n\n  // status / class\n  this.status = status;\n  this.statusType = type;\n\n  // basics\n  this.info = 1 == type;\n  this.ok = 2 == type;\n  this.clientError = 4 == type;\n  this.serverError = 5 == type;\n  this.error = (4 == type || 5 == type)\n    ? this.toError()\n    : false;\n\n  // sugar\n  this.accepted = 202 == status;\n  this.noContent = 204 == status || 1223 == status;\n  this.badRequest = 400 == status;\n  this.unauthorized = 401 == status;\n  this.notAcceptable = 406 == status;\n  this.notFound = 404 == status;\n  this.forbidden = 403 == status;\n};\n\n/**\n * Return an `Error` representative of this response.\n *\n * @return {Error}\n * @api public\n */\n\nResponse.prototype.toError = function(){\n  var msg = 'got ' + this.status + ' response';\n  var err = new Error(msg);\n  err.status = this.status;\n  return err;\n};\n\n/**\n * Expose `Response`.\n */\n\nrequest.Response = Response;\n\n/**\n * Initialize a new `Request` with the given `method` and `url`.\n *\n * @param {String} method\n * @param {String} url\n * @api public\n */\n\nfunction Request(method, url) {\n  var self = this;\n  Emitter.call(this);\n  this._query = this._query || [];\n  this.method = method;\n  this.url = url;\n  this.header = {};\n  this._header = {};\n  this.set('X-Requested-With', 'XMLHttpRequest');\n  this.on('end', function(){\n    var res = new Response(self.xhr);\n    if ('HEAD' == method) res.text = null;\n    self.callback(null, res);\n  });\n}\n\n/**\n * Inherit from `Emitter.prototype`.\n */\n\nRequest.prototype = new Emitter;\nRequest.prototype.constructor = Request;\n\n/**\n * Set timeout to `ms`.\n *\n * @param {Number} ms\n * @return {Request} for chaining\n * @api public\n */\n\nRequest.prototype.timeout = function(ms){\n  this._timeout = ms;\n  return this;\n};\n\n/**\n * Clear previous timeout.\n *\n * @return {Request} for chaining\n * @api public\n */\n\nRequest.prototype.clearTimeout = function(){\n  this._timeout = 0;\n  clearTimeout(this._timer);\n  return this;\n};\n\n/**\n * Abort the request, and clear potential timeout.\n *\n * @return {Request}\n * @api public\n */\n\nRequest.prototype.abort = function(){\n  if (this.aborted) return;\n  this.aborted = true;\n  this.xhr.abort();\n  this.clearTimeout();\n  this.emit('abort');\n  return this;\n};\n\n/**\n * Set header `field` to `val`, or multiple fields with one object.\n *\n * Examples:\n *\n *      req.get('/')\n *        .set('Accept', 'application/json')\n *        .set('X-API-Key', 'foobar')\n *        .end(callback);\n *\n *      req.get('/')\n *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })\n *        .end(callback);\n *\n * @param {String|Object} field\n * @param {String} val\n * @return {Request} for chaining\n * @api public\n */\n\nRequest.prototype.set = function(field, val){\n  if (isObject(field)) {\n    for (var key in field) {\n      this.set(key, field[key]);\n    }\n    return this;\n  }\n  this._header[field.toLowerCase()] = val;\n  this.header[field] = val;\n  return this;\n};\n\n/**\n * Get case-insensitive header `field` value.\n *\n * @param {String} field\n * @return {String}\n * @api private\n */\n\nRequest.prototype.getHeader = function(field){\n  return this._header[field.toLowerCase()];\n};\n\n/**\n * Set Content-Type to `type`, mapping values from `request.types`.\n *\n * Examples:\n *\n *      superagent.types.xml = 'application/xml';\n *\n *      request.post('/')\n *        .type('xml')\n *        .send(xmlstring)\n *        .end(callback);\n *\n *      request.post('/')\n *        .type('application/xml')\n *        .send(xmlstring)\n *        .end(callback);\n *\n * @param {String} type\n * @return {Request} for chaining\n * @api public\n */\n\nRequest.prototype.type = function(type){\n  this.set('Content-Type', request.types[type] || type);\n  return this;\n};\n\n/**\n* Add query-string `val`.\n*\n* Examples:\n*\n*   request.get('/shoes')\n*     .query('size=10')\n*     .query({ color: 'blue' })\n*\n* @param {Object|String} val\n* @return {Request} for chaining\n* @api public\n*/\n\nRequest.prototype.query = function(val){\n  if ('string' != typeof val) val = serialize(val);\n  this._query.push(val);\n  return this;\n};\n\n/**\n * Send `data`, defaulting the `.type()` to \"json\" when\n * an object is given.\n *\n * Examples:\n *\n *       // querystring\n *       request.get('/search')\n *         .end(callback)\n *\n *       // multiple data \"writes\"\n *       request.get('/search')\n *         .send({ search: 'query' })\n *         .send({ range: '1..5' })\n *         .send({ order: 'desc' })\n *         .end(callback)\n *\n *       // manual json\n *       request.post('/user')\n *         .type('json')\n *         .send('{\"name\":\"tj\"})\n *         .end(callback)\n *\n *       // auto json\n *       request.post('/user')\n *         .send({ name: 'tj' })\n *         .end(callback)\n *\n *       // manual x-www-form-urlencoded\n *       request.post('/user')\n *         .type('form')\n *         .send('name=tj')\n *         .end(callback)\n *\n *       // auto x-www-form-urlencoded\n *       request.post('/user')\n *         .type('form')\n *         .send({ name: 'tj' })\n *         .end(callback)\n *\n *       // defaults to x-www-form-urlencoded\n  *      request.post('/user')\n  *        .send('name=tobi')\n  *        .send('species=ferret')\n  *        .end(callback)\n *\n * @param {String|Object} data\n * @return {Request} for chaining\n * @api public\n */\n\nRequest.prototype.send = function(data){\n  var obj = isObject(data);\n  var type = this.getHeader('Content-Type');\n\n  // merge\n  if (obj && isObject(this._data)) {\n    for (var key in data) {\n      this._data[key] = data[key];\n    }\n  } else if ('string' == typeof data) {\n    if (!type) this.type('form');\n    type = this.getHeader('Content-Type');\n    if ('application/x-www-form-urlencoded' == type) {\n      this._data = this._data\n        ? this._data + '&' + data\n        : data;\n    } else {\n      this._data = (this._data || '') + data;\n    }\n  } else {\n    this._data = data;\n  }\n\n  if (!obj) return this;\n  if (!type) this.type('json');\n  return this;\n};\n\n/**\n * Invoke the callback with `err` and `res`\n * and handle arity check.\n *\n * @param {Error} err\n * @param {Response} res\n * @api private\n */\n\nRequest.prototype.callback = function(err, res){\n  var fn = this._callback;\n  if (2 == fn.length) return fn(err, res);\n  if (err) return this.emit('error', err);\n  fn(res);\n};\n\n/**\n * Invoke callback with x-domain error.\n *\n * @api private\n */\n\nRequest.prototype.crossDomainError = function(){\n  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');\n  err.crossDomain = true;\n  this.callback(err);\n};\n\n/**\n * Invoke callback with timeout error.\n *\n * @api private\n */\n\nRequest.prototype.timeoutError = function(){\n  var timeout = this._timeout;\n  var err = new Error('timeout of ' + timeout + 'ms exceeded');\n  err.timeout = timeout;\n  this.callback(err);\n};\n\n/**\n * Enable transmission of cookies with x-domain requests.\n *\n * Note that for this to work the origin must not be\n * using \"Access-Control-Allow-Origin\" with a wildcard,\n * and also must set \"Access-Control-Allow-Credentials\"\n * to \"true\".\n *\n * @api public\n */\n\nRequest.prototype.withCredentials = function(){\n  this._withCredentials = true;\n  return this;\n};\n\n/**\n * Initiate request, invoking callback `fn(res)`\n * with an instanceof `Response`.\n *\n * @param {Function} fn\n * @return {Request} for chaining\n * @api public\n */\n\nRequest.prototype.end = function(fn){\n  var self = this;\n  var xhr = this.xhr = getXHR();\n  var query = this._query.join('&');\n  var timeout = this._timeout;\n  var data = this._data;\n\n  // store callback\n  this._callback = fn || noop;\n\n  // CORS\n  if (this._withCredentials) xhr.withCredentials = true;\n\n  // state change\n  xhr.onreadystatechange = function(){\n    if (4 != xhr.readyState) return;\n    if (0 == xhr.status) {\n      if (self.aborted) return self.timeoutError();\n      return self.crossDomainError();\n    }\n    self.emit('end');\n  };\n\n  // progress\n  if (xhr.upload) {\n    xhr.upload.onprogress = function(e){\n      e.percent = e.loaded / e.total * 100;\n      self.emit('progress', e);\n    };\n  }\n\n  // timeout\n  if (timeout && !this._timer) {\n    this._timer = setTimeout(function(){\n      self.abort();\n    }, timeout);\n  }\n\n  // querystring\n  if (query) {\n    query = request.serializeObject(query);\n    this.url += ~this.url.indexOf('?')\n      ? '&' + query\n      : '?' + query;\n  }\n\n  // initiate request\n  xhr.open(this.method, this.url, true);\n\n  // body\n  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data) {\n    // serialize stuff\n    var serialize = request.serialize[this.getHeader('Content-Type')];\n    if (serialize) data = serialize(data);\n  }\n\n  // set header fields\n  for (var field in this.header) {\n    if (null == this.header[field]) continue;\n    xhr.setRequestHeader(field, this.header[field]);\n  }\n\n  // send stuff\n  xhr.send(data);\n  return this;\n};\n\n/**\n * Expose `Request`.\n */\n\nrequest.Request = Request;\n\n/**\n * Issue a request:\n *\n * Examples:\n *\n *    request('GET', '/users').end(callback)\n *    request('/users').end(callback)\n *    request('/users', callback)\n *\n * @param {String} method\n * @param {String|Function} url or callback\n * @return {Request}\n * @api public\n */\n\nfunction request(method, url) {\n  // callback\n  if ('function' == typeof url) {\n    return new Request('GET', method).end(url);\n  }\n\n  // url first\n  if (1 == arguments.length) {\n    return new Request('GET', method);\n  }\n\n  return new Request(method, url);\n}\n\n/**\n * GET `url` with optional callback `fn(res)`.\n *\n * @param {String} url\n * @param {Mixed|Function} data or fn\n * @param {Function} fn\n * @return {Request}\n * @api public\n */\n\nrequest.get = function(url, data, fn){\n  var req = request('GET', url);\n  if ('function' == typeof data) fn = data, data = null;\n  if (data) req.query(data);\n  if (fn) req.end(fn);\n  return req;\n};\n\n/**\n * GET `url` with optional callback `fn(res)`.\n *\n * @param {String} url\n * @param {Mixed|Function} data or fn\n * @param {Function} fn\n * @return {Request}\n * @api public\n */\n\nrequest.head = function(url, data, fn){\n  var req = request('HEAD', url);\n  if ('function' == typeof data) fn = data, data = null;\n  if (data) req.send(data);\n  if (fn) req.end(fn);\n  return req;\n};\n\n/**\n * DELETE `url` with optional callback `fn(res)`.\n *\n * @param {String} url\n * @param {Function} fn\n * @return {Request}\n * @api public\n */\n\nrequest.del = function(url, fn){\n  var req = request('DELETE', url);\n  if (fn) req.end(fn);\n  return req;\n};\n\n/**\n * PATCH `url` with optional `data` and callback `fn(res)`.\n *\n * @param {String} url\n * @param {Mixed} data\n * @param {Function} fn\n * @return {Request}\n * @api public\n */\n\nrequest.patch = function(url, data, fn){\n  var req = request('PATCH', url);\n  if ('function' == typeof data) fn = data, data = null;\n  if (data) req.send(data);\n  if (fn) req.end(fn);\n  return req;\n};\n\n/**\n * POST `url` with optional `data` and callback `fn(res)`.\n *\n * @param {String} url\n * @param {Mixed} data\n * @param {Function} fn\n * @return {Request}\n * @api public\n */\n\nrequest.post = function(url, data, fn){\n  var req = request('POST', url);\n  if ('function' == typeof data) fn = data, data = null;\n  if (data) req.send(data);\n  if (fn) req.end(fn);\n  return req;\n};\n\n/**\n * PUT `url` with optional `data` and callback `fn(res)`.\n *\n * @param {String} url\n * @param {Mixed|Function} data or fn\n * @param {Function} fn\n * @return {Request}\n * @api public\n */\n\nrequest.put = function(url, data, fn){\n  var req = request('PUT', url);\n  if ('function' == typeof data) fn = data, data = null;\n  if (data) req.send(data);\n  if (fn) req.end(fn);\n  return req;\n};\n\n/**\n * Expose `request`.\n */\n\nmodule.exports = request;\n//@ sourceURL=visionmedia-superagent/lib/client.js"
));
require.register("component-regexps/index.js", Function("exports, require, module",
"\nexports.email = /^(?:[\\w\\!\\#\\$\\%\\&\\'\\*\\+\\-\\/\\=\\?\\^\\`\\{\\|\\}\\~]+\\.)*[\\w\\!\\#\\$\\%\\&\\'\\*\\+\\-\\/\\=\\?\\^\\`\\{\\|\\}\\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\\-](?!\\.)){0,61}[a-zA-Z0-9]?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\\[(?:(?:[01]?\\d{1,2}|2[0-4]\\d|25[0-5])\\.){3}(?:[01]?\\d{1,2}|2[0-4]\\d|25[0-5])\\]))$/;\nexports.url = /^(?:(?:ht|f)tp(?:s?)\\:\\/\\/|~\\/|\\/)?(?:\\w+:\\w+@)?((?:(?:[-\\w\\d{1-3}]+\\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\\.uk|ac\\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\\b25[0-5]\\b|\\b[2][0-4][0-9]\\b|\\b[0-1]?[0-9]?[0-9]\\b)(\\.(\\b25[0-5]\\b|\\b[2][0-4][0-9]\\b|\\b[0-1]?[0-9]?[0-9]\\b)){3}))(?::[\\d]{1,5})?(?:(?:(?:\\/(?:[-\\w~!$+|.,=]|%[a-f\\d]{2})+)+|\\/)+|\\?|#)?(?:(?:\\?(?:[-\\w~!$+|.,*:]|%[a-f\\d{2}])+=?(?:[-\\w~!$+|.,*:=]|%[a-f\\d]{2})*)(?:&(?:[-\\w~!$+|.,*:]|%[a-f\\d{2}])+=?(?:[-\\w~!$+|.,*:=]|%[a-f\\d]{2})*)*)*(?:#(?:[-\\w~!$ |\\/.,*:;=]|%[a-f\\d]{2})*)?$/i;\nexports.cc = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\\d{3})\\d{11})$/,\nexports.urlsafe = /^[^&$+,\\/:=?@ <>\\[\\]\\{\\}\\\\^~%#]+$/;\n//@ sourceURL=component-regexps/index.js"
));
require.register("flashcard/index.js", Function("exports, require, module",
"/**\n * Module Dependencies\n */\n\nvar request = require('superagent'),\n    regex = require('regexps'),\n    template = require('./template');\n\n/**\n * Export Flashcard\n */\n\nmodule.exports = flashcard;\n\n/**\n * Initialize Flashcard\n */\n\nfunction flashcard(val) {\n  cards = val.split('===');\n  cards.forEach(function(card) {\n    card = card.trim();\n    if(!card) return;\n\n    card.split('\\n').forEach(function(line) {\n      if(regex.url.test(line)) return follow(line);\n    });\n  });\n}\n\nfunction follow(url) {\n  request\n    .get(url)\n    .end(function(res) {\n      console.log(res);\n    });\n}\n//@ sourceURL=flashcard/index.js"
));
require.register("flashcard/template.js", Function("exports, require, module",
"module.exports = '<div class = \"card\">\\n  <div class = \"front\">\\n\\n  </div>\\n  <div class = \"back\">\\n\\n  </div>\\n</div>\\n';//@ sourceURL=flashcard/template.js"
));
require.alias("visionmedia-superagent/lib/client.js", "flashcard/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "flashcard/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");

require.alias("component-regexps/index.js", "flashcard/deps/regexps/index.js");

require.alias("flashcard/index.js", "flashcard/index.js");

