/* Author:

*/

require.config({
  paths: {
	// plugins
	order: 'libs/require/order',
	text: 'libs/require/text',
	
	// libs
    jQuery: 'libs/require/jquery',
    Underscore: 'libs/require/underscore',
    Backbone: 'libs/require/backbone',
    Chatanoo: 'libs/require/chatanoo'
  }, 
  waitSeconds: 45
});

require([
  'app/app'
], function(App) {
	console.log("App loaded");
  	App.initialize();
});
/*
require([
	'jQuery'
], function($) {
	$(document).ready( function() {
		$.ajax({
			url: "http://localhost:3000/users",
			dataType: "json",
			type: "GET",
			processData: false,
			contentType: "application/json"
		});
	})
});*/




