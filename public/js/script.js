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
    Chatanoo: 'libs/require/chatanoo',

	// configs
	Config: 'app/config'
  }, 
  waitSeconds: 45
});

require([
  'app/app'
], function(App) {
	console.log("App loaded");
  	App.initialize();
});




