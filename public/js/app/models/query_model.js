define([
  'Backbone',
  'Underscore',
  'Chatanoo',
  
  'app/collections/items'
], function(Backbone, _, Chatanoo,
  Items) {
  
  var Query = Backbone.Model.extend(
  {
      // Default attributes for the Query item.
      defaults: function() {
        return {};
      },
  
    urlRoot: "/queries",
  
    items: new Items(),
    
    isOnError: false,
  
      initialize: function() {
      this.on("change:id", function() { this.items.url = this.urlRoot + "/" + this.get("id") + "/items"; }, this);
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
  
    loadQuery: function() {
      this.isOnError = false;
      
      var mThis = this;
      var r = Chatanoo.queries.getQueryById( this.get("id") );
      Chatanoo.queries.on( r.success, function(query) {
        mThis.set( query );
        if( mThis.get('_user') > 0)
          mThis.loadUser();
      }, mThis);
      Chatanoo.queries.on( r.error, function(query) {
        mThis.isOnError = true;
        mThis.trigger("change");
      }, mThis);
    },
  
    loadItems: function() {
      this.items.remove(this.items.toArray());
      var mThis = this;
      var r = Chatanoo.items.getItemsByQueryId( this.get("id") );
      Chatanoo.items.on( r.success, function(items) {
        _(items).each( function (item) { mThis.items.push(item); } );
        mThis.trigger("change change:items");
      }, mThis);
    },
    
    
    addQuery: function(query) {
      var r = Chatanoo.queries.addQuery( query );
      Chatanoo.queries.on( r.success, function( queryId ) {
        this.set( 'id', queryId );
        this.set( query );
        this.trigger("added");
      }, this);
    },

    editQuery: function(options) {
      var query = _.extend(this.toJSON(), options);
      var r = Chatanoo.queries.setQuery( query );
      Chatanoo.queries.on( r.success, function( queryId ) {
        this.set(options);
        this.trigger("edited");
      }, this);
    },
    
    
    validateQuery: function() {
      var r = Chatanoo.queries.validateVo( this.get("id"), true, false );
      Chatanoo.queries.on( r.success, function( queryId ) {
        this.trigger("change:validate");
        this.loadQuery();
        this.loadItems();
      }, this);
    },
    
    unvalidateQuery: function() {
      var r = Chatanoo.queries.validateVo( this.get("id"), false, false );
      Chatanoo.queries.on( r.success, function( queryId ) {
        this.trigger("change:unvalidate");
        this.loadQuery();
        this.loadItems();
      }, this);
    },
    
    deleteQuery: function() {
      var r = Chatanoo.queries.deleteQuery( this.get("id") );
      Chatanoo.queries.on( r.success, function( bool ) {
        this.trigger("delete");
      }, this);
    }
  });
  //_.extend(Query, Chatanoo.ValueObject.Query);

  return Query;
});