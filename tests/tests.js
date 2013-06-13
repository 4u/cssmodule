var CssModule = require('../lib/cssmodule');

var cssModule = new CssModule();
cssModule.createModule('my.styles.Main', './style.css', './style.js', '/style.css');
