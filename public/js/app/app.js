define([
  'jquery',
  'underscore',
  'backbone',
  'chatanoo',
  'app/router',

  'config',

  'moment'
], function($, _, Backbone, Chatanoo, Router, Config) {
  var initialize = function() {
  Chatanoo.init(Config.chatanoo.url, Config.chatanoo.api_key);

  window.isLogged = false;
    Router.initialize();
  }

  return {
    initialize: initialize
  };
});
