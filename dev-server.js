var fs = require('fs');
var path = require('path');
var express = require('express');
var _ = require('ramda');
var webpack = require('webpack');

var config = require('./webpack.config.dev');
var template = fs.readFileSync('./template.html').toString();

var app = express();
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.get('/base.css', function(req, res) {
  res.sendFile(path.join(__dirname, req.path));
});

app.get(['/:bundle', '/'], function(req, res) {
  var bundleName = req.params.bundle || 'index';
  var isValidBundleName = _.contains(bundleName, _.keys(config.entry));
  res.send(
    isValidBundleName
    ? template.replace('{bundleName}', bundleName).replace(/\{basePath\}/gm, '')
    : 'Nope.'
  );
});

app.listen(3000, 'localhost', function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:3000');
});
