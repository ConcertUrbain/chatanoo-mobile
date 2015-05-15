define([
	'Backbone',
	'Underscore',
	'Chatanoo',
	
	'app/collections/medias',
	'app/collections/comments',
	'app/collections/metas'
], function(Backbone, _, Chatanoo, 
	Medias, Comments, Metas) {
	
	var Item = Backbone.Model.extend(
	{
	    // Default attributes for the Query item.
	    defaults: function() {
	      return {};
	    },
	
	    initialize: function() {
		
	    },

		isOnError: false,
	
		loadItem: function() {
			this.isOnError = false;
			this.comments.remove(this.comments.toArray());
			this.medias.remove(this.medias.toArray());
				
			var mThis = this;
			var r = Chatanoo.items.getItemById( this.get("id") );
			Chatanoo.items.on( r.success, function(item) {
				this.set(item);				
				this.loadUser();		
				this.loadComments();
				this.loadMedias();
				this.loadQuery();
				this.loadMetas();
				mThis.trigger("change");
			}, mThis);
			Chatanoo.items.on( r.error, function() {
				this.isOnError = true;
				mThis.trigger("change");
			}, mThis);
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
		
		comments: new Comments(),
		loadComments: function() {
			this.comments.remove(this.comments.toArray());
			
			var mThis = this;
			var r = Chatanoo.comments.getCommentsByItemId( this.get("id") );
			Chatanoo.comments.on( r.success, function(comments) {
				_(comments).each( function(comment) { mThis.comments.push(comment); } );
				mThis.trigger("change change:comments");
				
				mThis.comments.each( function(comment) { 
					if( comment.get('_user') > 0 )
						comment.loadUser();
					comment.loadRate(); 
				} );
			}, mThis);
		},
		
		medias: new Medias(),
		loadMedias: function() {
			this.medias.remove(this.medias.toArray());
			
			var mThis = this;
			var r = Chatanoo.medias.getMediasByItemId( this.get("id") );
			Chatanoo.medias.on( r.success, function(medias) {
				_(medias).each( function(type) { 
					_(type).each( function(media) { mThis.medias.push(media); } ); 
					mThis.trigger("change change:medias");
				}, this );
			}, mThis);
		},
		
		query: null,
		loadQuery: function() {			
			var mThis = this;
			var r = Chatanoo.queries.getQueriesByItemId( this.get("id") );
			Chatanoo.queries.on( r.success, function(queries) {
				require(['app/models/query_model'], function(Query){
					mThis.query = new Query( _(queries).first() ); 
					mThis.trigger("change change:query");
				});
			}, mThis);
		},
		
		metas: new Metas(),
		loadMetas: function() {
			this.metas.remove(this.metas.toArray());
			
			var mThis = this;
			var r = Chatanoo.search.getMetasByVo( this.get("id"), 'Item' );
			Chatanoo.search.on( r.success, function(metas) {
				_(metas).each( function(meta) { mThis.metas.push(meta); } );
				mThis.trigger("change change:metas");
			}, mThis);
		},
		
		// Comment
		addComment: function(comment) {		
			var mThis = this;
			var r = Chatanoo.items.addCommentIntoItem( comment, this.get("id") );
			Chatanoo.items.on( r.success, function( commentId ) {
				mThis.trigger("comment:added");
				mThis.loadComments();
			}, mThis);
			Chatanoo.items.on( r.error, function( ) {
				mThis.trigger("comment:added:error");
			}, mThis);
		},
		
		addItem: function(item) {
			var r = Chatanoo.queries.addItemIntoQuery( item, this.get( 'query_id' ) );
			Chatanoo.queries.on( r.success, function( itemId ) {
				this.set( 'id', itemId );
				this.set( item );
				this.trigger("added");
			}, this);
		},

		editItem: function(options) {
			var item = _.extend(this.toJSON(), options);
			delete item.query_id;
			
			var r = Chatanoo.items.setItem( item );
			Chatanoo.items.on( r.success, function( itemId ) {
				this.set(options);
				this.trigger("edited");
			}, this);
		},
		
		validateItem: function() {
			var r = Chatanoo.items.validateVo( this.get("id"), true, false );
			Chatanoo.items.on( r.success, function( itemId ) {
				this.trigger("change:validate");
				this.loadItem();
			}, this);
		},
		
		unvalidateItem: function() {
			var r = Chatanoo.items.validateVo( this.get("id"), false, false );
			Chatanoo.items.on( r.success, function( itemId ) {
				this.trigger("change:unvalidate");
				this.loadItem();
			}, this);
		},
		
		deleteItem: function() {
			var r = Chatanoo.items.deleteItem( this.get("id") );
			Chatanoo.items.on( r.success, function( bool ) {
				this.trigger("delete");
			}, this);
		}
	});
	//_.extend(Item, Chatanoo.ValueObject.Item);
	
	return Item;
});