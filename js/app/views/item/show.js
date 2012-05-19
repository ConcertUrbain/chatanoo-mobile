define([
	'Backbone',
	'Underscore',
	'jQuery',
	'Chatanoo',
	
	'app/models/item_model',
	
	'app/views/comment/show',
	
	'text!app/templates/item/show.tmpl.html',
	'text!app/templates/item/error.tmpl.html',
	
	'app/views/app_view'
], function(Backbone, _, $, Chatanoo,
	Item,
	CommentView,
	template, error,
	app_view) {
	
	var ItemView = Backbone.View.extend(
	{
		el: $("#wrapper"),
		
		model: null,
		
		events: {
			"click form#comment-form input[type=button]": "addComment",
			"click nav a": "gotoMedia",
			
			//admin
			"click #wrapper > .admin input[name=validate]": "validateItem",
			"click #wrapper > .admin input[name=unvalidate]": "unvalidateItem",
			"click #wrapper > .admin input[name=edit]": "editItem",
			"click #wrapper > .admin input[name=delete]": "deleteItem"
		},
		
		initialize: function() {
			this.model = new Item();
			this.model.on("change", this.render, this);
			
			this.model.on("comment:added change:validate change:unvalidate", function() {
				app_view.overlay.show('valid', 3000);
			}, this);
			this.model.on("comment:added:error", function() {
				app_view.overlay.show('error', 3000);
			}, this);
			
			this.model.on("delete", function() {
				app_view.overlay.show('valid', 2000);
				
				var mThis = this;
				setTimeout( function() {
					location.hash = "/queries/" + mThis.model.get('query_id');
					app_view.gotoQuery( mThis.model.get('query_id') );
				}, 2000);
			}, this);
	    },
		
		render: function() {
			this.$el.removeClass().addClass('item-view');
			
			if( this.model.get('title') )
				app_view.header.model.set( "title", this.model.get('title') );
			
			if( this.model.isOnError )
			{
				this.$el.html(_.template(error, { item: this.model, user: app_view.user }));
				app_view.header.model.set("title", "Erreur");
				return this;
			}
			
			this.$el.html(_.template(template, { item: this.model, user: app_view.user }));
			
			var els = [];
			var ordered = this.model.comments.sortBy( function(comment) { return comment.get("addDate").valueOf(); } );
			_(ordered).each( function (comment) {
				var cv = new CommentView( { model: comment } );
				els.push( cv.render().el );
			});		
			this.$el.find(".comments").append( els );
			
			this.$el.find('textarea').elastic();
			
			return this;
		},
		
		gotoMedia: function(event) {
			var scroller = $(".scroller");
			var mediabox = $("#mediabox");
			var nb = $(event.currentTarget).text() - 1;
			
			var media = $($(".media")[nb]);
			
			scroller.animate({
				height: media.height(),
				left: "-" + nb * 100 + "%"
			}, 400);
			mediabox.animate({
				height: media.height()
			}, 400);
			
			$('#mediabox + nav a').removeClass('selected');
			$('#mediabox + nav a:eq(' + nb + ')').addClass('selected');
			
			return false;
		},
		
		addComment: function(event) {	
			var content = $("form textarea[name=comment]").val();
			if(content == "")
				return false;
				
			var c = new Chatanoo.ValueObject.Comment( { content: content } );
			this.model.addComment( c );
			return false
		},
		
		validateItem: function() {
			this.model.validateItem();
		},
		
		unvalidateItem: function() {
			this.model.unvalidateItem();
		},
		
		editItem: function() {
			location.hash = "/queries/" + this.model.get( 'query_id' ) + "/items/" + this.model.get( 'id' ) + "/edit";
			//app_view.gotoEditItem( this.model.get( 'query_id' ), this.model.get( 'id' ) );
		},
		
		deleteItem: function() {
			var r = confirm("Voulez vous vraiment supprimer cette contribution ?");
			if( r ) {
				this.model.deleteItem();
			}
		},
		
		kill: function() {
			this.$el.unbind()
			this.model.off();
		}
	});
	
	return ItemView;
});