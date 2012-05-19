define([
	'Backbone',
	'Underscore',
	'Chatanoo'
], function(Backbone, _, Chatanoo) {

	var Media = Backbone.Model.extend(
	{
	    // Default attributes for the Query item.
	    defaults: function() {
	      return {};
	    },
	
	    initialize: function() {
		
	    },

		validateMedia: function() {
			var r = Chatanoo.medias.validateMedia( this.get("id"), 'Video', true );
			Chatanoo.medias.on( r.success, function( mediaId ) {
				this.trigger("change change:validate");
				this.set('_isValid', 1);
			}, this);
		},
        
		unvalidateMedia: function() {
			var r = Chatanoo.medias.validateMedia( this.get("id"), 'Video', false );
			Chatanoo.medias.on( r.success, function( mediaId ) {
				this.trigger("change change:unvalidate");
				this.set('_isValid', 0);
			}, this);
		},
        
		deleteMedia: function() {
			var r = Chatanoo.medias.deleteMedia( this.get("id") );
			Chatanoo.medias.on( r.success, function( bool ) {
				this.trigger("delete");
			}, this);
		},
		
		addMedia: function(media) {
			var r = Chatanoo.items.addMediaIntoItem( media, this.get( 'item_id' ) );
			Chatanoo.items.on( r.success, function( mediaId ) {
				this.set( 'id', mediaId );
				this.set( media );
				this.trigger("added");
			}, this);
		},
        
		editMedia: function(options) {
			var media = _.extend(this.toJSON(), options);
			var r = Chatanoo.medias.setMedia( media );
			Chatanoo.medias.on( r.success, function( mediaId ) {
				this.set(options);
				this.trigger("edited");
			}, this);
		}
	});
	//_.extend(Media, Chatanoo.ValueObject.Media.Abstract); 
	
	return Media;
});