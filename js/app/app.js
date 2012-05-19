define([
  	'order!jQuery',
  	'order!Underscore',
  	'order!Backbone', 
  	'order!Chatanoo',
  	'order!app/router',

	'order!Config',

	'order!libs/moment',
	'order!libs/moment.lang.fr'
], function($, _, Backbone, Chatanoo, Router, Config) {
  	var initialize = function() {
		Chatanoo.init(Config.chatanoo.url, Config.chatanoo.api_key);
		moment.lang("fr");
		
		window.isLogged = false;
	
    	Router.initialize();
  	}

  	return {
    	initialize: initialize
  	};
});