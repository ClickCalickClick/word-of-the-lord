// Clay configuration for Pebble settings
var Clay = require('pebble-clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig, null, { autoHandleEvents: false });

Pebble.addEventListener('ready', function() {
  console.log('Pebble app ready');
});

Pebble.addEventListener('showConfiguration', function(e) {
  console.log('showConfiguration event');
  Pebble.openURL(clay.generateUrl());
});

Pebble.addEventListener('webviewclosed', function(e) {
  console.log('webviewclosed event');
  if (e.response) {
    var config = clay.getSettings(e.response);
    Pebble.sendAppMessage(config);
  }
});