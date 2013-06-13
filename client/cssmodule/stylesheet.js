goog.provide('cssmodule.Stylesheet');

goog.require('cssmodule.Manager');

/**
 * @param {string} name
 * @param {string} data
 * @param {string=} uri
 * @constructor
 */
cssmodule.Stylesheet = function(name, data, uri) {
  this._name = name;
  this._data = data;
  this._uri = uri || '';
  cssmodule.Manager.getInstance().register(this);
};

/** @return {string} */
cssmodule.Stylesheet.prototype.getName = function() {
  return this._name;
};

/** @return {string} */
cssmodule.Stylesheet.prototype.getData = function() {
  return this._data;
};

/** @return {string} */
cssmodule.Stylesheet.prototype.getUri = function() {
  return this._uri;
};

cssmodule.Stylesheet.prototype.install = function() {
  cssmodule.Manager.getInstance().install(this);
};

cssmodule.Stylesheet.prototype.uninstall = function() {
  cssmodule.Manager.getInstance().uninstall(this);
};
