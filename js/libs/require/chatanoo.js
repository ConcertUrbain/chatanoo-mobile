define([
	"order!libs/jquery-1.7.2",
	"order!libs/underscore-1.3.3",
	"order!libs/chatanoo-0.1.0"
], function() {
	console.log('Chatanoo loaded');
	return Chatanoo.noConflict();
});