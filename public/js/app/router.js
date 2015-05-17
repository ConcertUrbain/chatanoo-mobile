define([
    'jQuery',
    'Underscore',
    'Backbone',
    'Chatanoo',

  'app/views/app_view'
], function ($, _, Backbone, Chatanoo,
  app_view) {
  
  var AppRouter = Backbone.Router.extend(
  {
      routes: 
    {
      "login": "login",
      "session": "session",
      
      "queries/new": "addQuery",
      "queries/:qid/edit": "editQuery",
      "queries/:qid": "queries",
      
      "queries/:qid/items/new": "addItem",
      "queries/:qid/items/:iid/edit": "editItem",
      "queries/:qid/items/:iid": "items",
      
        "*actions": "defaultRoute" // Backbone will try match the route above first
      },
  
    app_view: app_view, 
  
    // LOGIN
    login: function()
    {     
      this.app_view.gotoLogin();
    },
  
    // SESSION
    session: function()
    {
      if( this.testConnection() ) {
        this.app_view.gotoSession();      
      }
    },

    // QUERIES
    queries: function( id )
    {
      if( this.testConnection() ) {
        this.app_view.gotoQuery( id );    
      }
    },
  
    addQuery: function( )
    {
      if( this.testConnection() ) {
        this.app_view.gotoAddQuery();   
      }
    },
  
    editQuery: function( id )
    {
      if( this.testConnection() ) {
        this.app_view.gotoEditQuery( id );    
      }
    },
  
    // ITEMS
    items: function( query_id, item_id )
    {
      if( this.testConnection() ) {
        this.app_view.gotoItem( query_id, item_id );        
      }
    },
    
    addItem: function( query_id )
    {
      if( this.testConnection() ) {
        this.app_view.gotoAddItem( query_id );        
      }
    },
    
    editItem: function( query_id, item_id )
    {
      if( this.testConnection() ) {
        this.app_view.gotoEditItem( query_id, item_id );        
      }
    },
  
  
    // DEFAULT
    defaultRoute: function( actions )
    {
      location.hash = "/login";
    },
  
    testConnection: function() {
      if(window.isLogged)
        return true;
      
      var session_key = $.cookie('session_key');  
      if( !_.isNull( session_key ) )
      {
        window.isLogged = true;
        Chatanoo.sessionKey = session_key;
        return true;
      }
        
      location.hash = "/login";
      return false;
    }
  });

  var initialize = function() {
    var instance = new AppRouter;
    instance.app_view.render();
    Backbone.history.start();
  };

  return {
    initialize: initialize
  };
});
