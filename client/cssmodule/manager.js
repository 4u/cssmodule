goog.provide('cssmodule.Manager');

goog.require('goog.dom');
goog.require('goog.Timer');
goog.require('goog.style');
goog.require('goog.events.EventTarget');
goog.require('goog.net.XmlHttp');
goog.require('goog.debug.Logger');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cssmodule.Manager = function() {
  goog.base(this);
  this._sheets = {};
  this._installed = {};
  this._installedLinks = {};
  this._installedTimers = {};
  this._logger = goog.debug.Logger.getLogger('cssmodule.Manager');
};
goog.inherits(cssmodule.Manager, goog.events.EventTarget);
goog.addSingletonGetter(cssmodule.Manager);

/**
 * @type {boolean}
 * @private
 */
cssmodule.Manager.prototype._devMode = false;

/** @return {boolean} */
cssmodule.Manager.prototype.isDevMode = function() {
  return this._devMode;
};

/** @param {boolean} mode */
cssmodule.Manager.prototype.setDevMode = function(mode) {
  this._devMode = mode;
};

/**
 * @param {cssmodule.Stylesheet} stylesheet
 */
cssmodule.Manager.prototype.register = function(stylesheet) {
  this._sheets[stylesheet.getName()] = stylesheet;
};

/**
 * @param {cssmodule.Stylesheet} stylesheet
 */
cssmodule.Manager.prototype.install = function(stylesheet) {
  var name = stylesheet.getName();
  if (this._installed[name]) {
    return;
  }
  this._installed[name] = goog.style.installStyles(stylesheet.getData());
  if (this.isDevMode()) {
    this._installAsLink(stylesheet);
  }
};

/**
 * @param {cssmodule.Stylesheet} stylesheet
 */
cssmodule.Manager.prototype._installAsLink = function(stylesheet) {
  var uri = stylesheet.getUri();
  var name = stylesheet.getName();
  this._installedLinks[name] = goog.dom.createDom(goog.dom.TagName.LINK, {
    'rel': 'stylesheet',
    'href': uri,
    'type': 'text/css',
    'charset': 'utf-8'
  });

  /** @type {Element} */
  var firstScript = goog.dom.getElementsByTagNameAndClass('script')[0];
  goog.dom.insertSiblingBefore(this._installedLinks[name], firstScript);

  /**
   * Try to open the XMLHttpRequest (always sync), if an error occurs here it
   * is generally permission denied
   * @preserveTry
   */
  try {
    var xhr = goog.net.XmlHttp();
    this._logger.fine('Opening Xhr: ' + uri);
    xhr.open('GET', uri, false);
    xhr.send(null);
    this._logger.fine('Xhr loaded: ' + uri);
    this._installedTimers[name] = goog.Timer.callOnce(function() {
      goog.style.uninstallStyles(this._installed[name]);
      this._logger.fine('Uninstall style for ' + name + ' because we have link');
    }, 2000, this);
  } catch (err) {
    this._logger.fine('Error opening Xhr: ' + err.message);
  }
};

/**
 * @param {cssmodule.Stylesheet|string} name
 */
cssmodule.Manager.prototype.uninstall = function(name) {
  name = goog.isString(name) ? name : name.getName();
  if (this._installed[name]) {
    goog.style.uninstallStyles(this._installed[name]);
    delete this._installed[name];
  }
  if (this._installedTimers[name]) {
    goog.Timer.clear(this._installedTimers[name]);
  }
  if (this._installedLinks[name]) {
    goog.dom.removeNode(this._installedLinks[name]);
    delete this._installedLinks[name];
  }
};
