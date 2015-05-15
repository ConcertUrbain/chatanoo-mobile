define([
	'Backbone',
	'Underscore',
	'jQuery',
	'Chatanoo'
], function(Backbone, _, $, Chatanoo) {

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
			Chatanoo.connect(this.get("login"), this.get("pass"));
		}		
	});

	return Login;
});