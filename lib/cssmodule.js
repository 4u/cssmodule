var async = require('async');
var ejs = require('ejs');
var fs = require('fs');
var path = require('path');

var CssModule = function() {};

CssModule.prototype.createModule = function(name, source, destination,
                                            uri, opt_template, opt_fixMapUrl, opt_callback) {
  var self = this;
  async.waterfall([
    function(callback){
        fs.readFile(source, callback);
    },
    function(data, callback){
      var queue = [];
      queue.push(function(callback) {
        fs.writeFile(destination,
            self.composeClientModule(name, source, destination, data, uri, opt_template),
            callback);
      });
      if (opt_fixMapUrl) {
        queue.push(function(callback) {
          var timestamp = +new Date();
          fs.writeFile(source,
              data.toString().replace(/(\n*\/\*@ sourceMappingURL=[^ ]+?)( \*\/\n*)$/, '$1?' + timestamp + '$2'),
              callback);
        });
      }
      async.parallel(queue, callback);
    }
  ], function (err, result) {
    if (!err) {
      process.stdout.write("Module '" + name + "' has been created.\n");
    }
    opt_callback && opt_callback(err, result);
  });
};

CssModule.prototype.composeClientModule = function(name, source, destination,
                                                   data, uri,
                                                   opt_template) {
  var templatePath = opt_template || path.resolve(__dirname, 'template.ejs');
  var template = fs.readFileSync(templatePath);
  if (!template) {
    throw Error('Bad template path: ' + opt_template);
  }
  return ejs.render(template.toString(), {
    source: source,
    destination: destination,
    name: name,
    data: data.toString(),
    uri: uri
  });
};

module.exports = CssModule;
