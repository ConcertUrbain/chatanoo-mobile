define([
	'Backbone',
	'app/models/media_model'
], function(Backbone, Media) {
	
	var Medias = Backbone.Collection.extend({
	    model: Media,
	
		videos: function() {
			
		},
		picture: function() {
			
		},
		sounds: function() {
			
		},
		texts: function() {
			
		}
	});

	return Medias
});