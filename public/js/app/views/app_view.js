define([
  'backbone',
  'underscore',
  'jquery',
  'chatanoo',

  'app/models/header_model',
  'app/views/header_view',
  'app/views/overlay_view',

  'text!app/templates/app.tmpl.html'
], function(Backbone, _, $, Chatanoo,
  Header, HeaderView, OverlayView,
  template) {

  var AppView = Backbone.View.extend(
  {
    el: "body",

    header: null,
    content: null,
    overlay: null,
    user: null,

    initialize: function() {
      console.log("init");
      this.$el.html(_.template(template, this.model));
      this.header = new HeaderView( { el: $('header'), model: new Header() } );
      this.header.on('logout', this.logout, this);

      this.overlay = new OverlayView( { el: $('#overlay') } );
      this.overlay.hide('loading');

      Chatanoo.on('loading', function() {
        this.overlay.show('loading');
      }, this);

      Chatanoo.on('finish', function() {
        this.overlay.hide('loading');
      }, this);
      },

    getCurrentUser: function() {
      if( _.isUndefined( Chatanoo.connection ) )
        return;

      var mThis = this;
      var r = Chatanoo.connection.getCurrentUser();
      Chatanoo.connection.on( r.success, function(user) {
        this.user = user;
        this.trigger("change change:user");
        this.render();
      }, mThis);
    },

    render: function() {
      if( _.isNull(this.user) )
        this.getCurrentUser();

      this.header.render();

      if( !_.isNull(this.content) )
        this.content.render();

      return this;
    },

    logout: function() {
      location.hash = '/login';
    },

    _gotoView: function(view, options, callback) {
      if( !_.isNull(this.content) && _.isFunction(this.content.kill))
        this.content.kill();

      options = options || {};

      var mThis = this;
      require([view], function( View ) {
        mThis.content = new View( options );
        callback.apply( mThis, [mThis.content] );
        mThis.render();
      });
    },

    gotoLogin: function() {
      this._gotoView( 'app/views/login_view', {}, function ( login_view ) {
        this.header.model.set({
          "title": null,
          "section": null,
          "back": false,
          "close": false
        });
      } );
    },

    gotoSession: function() {
      this._gotoView( 'app/views/session_view', {}, function ( session_view ) {
        this.header.model.set({
          "title": "Questions",
          "section": "session",
          "back": false,
          "close": false
        });

        session_view.model.loadQueries();
      } );
    },

    // Queries
    gotoQuery: function( id ) {
      this._gotoView( 'app/views/query/show', {}, function ( query_view ) {
        this.header.model.set({
          "title": "Chargement...",
          "section": "query",
          "back": "#/session",
          "close": false
        });

        query_view.model.set("id", id);
        query_view.model.loadQuery();
        query_view.model.loadItems();
      } );
    },

    gotoAddQuery: function( ) {
      this._gotoView( 'app/views/query/new', {}, function ( query_view ) {
        this.header.model.set({
          "title": "Poser ma question",
          "section": "query",
          "back": false,
          "close": "#/session"
        });

        query_view.mode = "new";
        query_view.render();
      } );
    },

    gotoEditQuery: function( id ) {
      this._gotoView( 'app/views/query/new', {}, function ( query_view ) {
        this.header.model.set({
          "title": "Editer ma question",
          "section": "query",
          "back": false,
          "close": "#/queries/" + id
        });

        query_view.mode = "edit";
        query_view.model.set("id", id);
        query_view.model.loadQuery();
      } );
    },

    // Items
    gotoItem: function( query_id, item_id ) {
      this._gotoView( 'app/views/item/show', {}, function ( item_view ) {
        this.header.model.set({
          "title": "Chargement...",
          "section": "item",
          "back": "#/queries/" + query_id,
          "close": false
        });

        item_view.model.set("id", item_id);
        item_view.model.set("query_id", query_id);
        item_view.model.loadItem();
      } );
    },

    gotoAddItem: function( query_id ) {
      this._gotoView( 'app/views/item/new', {}, function ( item_view ) {
        this.header.model.set({
          "title": "Contribuer",
          "section": "item",
          "back": false,
          "close": "#/queries/" + query_id
        });

        item_view.mode = "new";
        item_view.model.set("query_id", query_id);
        item_view.model.loadItem();
      } );
    },

    gotoEditItem: function( query_id, item_id ) {
      this._gotoView( 'app/views/item/new', {}, function ( item_view ) {
        this.header.model.set({
          "title": "Modifier ma contribution",
          "section": "item",
          "back": false,
          "close": "#/queries/" + query_id + "/items/" + item_id
        });

        item_view.mode = "edit";
        item_view.model.set("id", item_id);
        item_view.model.set("query_id", query_id);
        item_view.model.loadItem();
      } );
    }
  });

  var app = new AppView;

  return app;
});
