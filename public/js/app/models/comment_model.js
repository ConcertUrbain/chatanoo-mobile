define([
	'Backbone',
	'Underscore',
	'Chatanoo'
], function(Backbone, _, Chatanoo) {
	
	var Comment = Backbone.Model.extend(
	{
	    // Default attributes for the Query item.
	    defaults: function() {
	      return {};
	    },
	
	    initialize: function() {
		
	    },
		
		user: null,
		loadUser: function() {        
			var mThis = this;
			var r = Chatanoo.users.getUserById( this.get("_user") );
			Chatanoo.users.on( r.success, function(user) {
				mThis.user = user;
				mThis.trigger("change change:user");
			}, mThis);
		},
		
		rate: 0,
		loadRate: function() {
			var mThis = this;
			var r = Chatanoo.datas.getDatasByCommentId( this.get("id") );
			Chatanoo.datas.on( r.success, function(datas) {
				mThis.rate = 0;
				if ( !_.isUndefined(datas.Vote) )
					_(datas.Vote).each( function(vote) { mThis.rate += (vote.rate - 0); } );
				this.trigger("change change:rate");
			}, mThis);
		},
		
		validateComment: function() {
			var r = Chatanoo.comments.validateVo( this.get("id"), true, false );
			Chatanoo.comments.on( r.success, function( commentId ) {
				this.trigger("change change:validate");
				this.set('_isValid', 1);
			}, this);
		},
		
		unvalidateComment: function() {
			var r = Chatanoo.comments.validateVo( this.get("id"), false, false );
			Chatanoo.comments.on( r.success, function( commentId ) {
				this.trigger("change change:unvalidate");
				this.set('_isValid', 0);
			}, this);
		},
		
		deleteComment: function() {
			var r = Chatanoo.comments.deleteComment( this.get("id") );
			Chatanoo.comments.on( r.success, function( bool ) {
				this.trigger("delete");
			}, this);
		},
		
		editComment: function(options) {
			var comment = _.extend(this.toJSON(), options);
			var r = Chatanoo.comments.setComment( comment );
			Chatanoo.comments.on( r.success, function( commentId ) {
				this.set(options);
				this.trigger("edited");
			}, this);
		}
	});
	//_.extend(Comment, Chatanoo.ValueObject.Comment);
	
	return Comment;
});