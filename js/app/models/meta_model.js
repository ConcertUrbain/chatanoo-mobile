define([
	'Backbone',
	'Underscore',
	'Chatanoo'
], function(Backbone, _, Chatanoo) {
	
	var Meta = Backbone.Model.extend(
	{
	    // Default attributes for the Query item.
	    defaults: function() {
	      return {};
	    },
	
	    initialize: function() {
		
	    }
	});
	//_.extend(Meta, Chatanoo.ValueObject.Meta);
	
	return Meta;
});