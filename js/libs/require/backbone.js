define([
	"order!libs/underscore-1.3.3",
	"order!libs/jquery-1.7.2",
	"order!libs/backbone-0.9.2"
], function() {
	console.log('Backbone loaded');
	//_.noConflict();
	//$.noConflict();
	return Backbone.noConflict();
});