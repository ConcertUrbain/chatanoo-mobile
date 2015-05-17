define([
  'Backbone',
  'Underscore',
  'jQuery',
  'Chatanoo',
  'Config'
], function(Backbone, _, $, Chatanoo, Config) {

  var Login = Backbone.Model.extend(
  {
    // Default attributes for the Query item.
    defaults: function() {
      return {
        login: null,
        pass: null
      };
    },

    initialize: function() {

    },

    connect: function() {
      Chatanoo.on('connect', function() {
        window.isLogged = true;
        $.cookie('session_key', Chatanoo.sessionKey, { expires: 7 });

        location.hash = "/session";
      }, this);
      Chatanoo.on('connect:error', function() {
        alert('Identifiant ou mot de passe incorrect.')
      }, this);
      Chatanoo.init(Config.chatanoo.url, this.get("session"));
      Chatanoo.connect(this.get("login"), this.get("pass"));
    }
  });

  return Login;
});
