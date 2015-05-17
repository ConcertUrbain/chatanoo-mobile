define([
  'Backbone',
  'Underscore',
  'Chatanoo',
  
  'app/collections/queries'
], function(Backbone, _, Chatanoo,
  Queries) {
  
  var Session = Backbone.Model.extend({
      // Default attributes for the header item.
      defaults: function() {
        return {};
      },
  
    queries: new Queries(),
  
      initialize: function() {
    
      },
  
    loadQueries: function() {
      this.queries.remove(this.queries.toArray());
      
      var mThis = this;
      var r = Chatanoo.queries.getQueries();
      Chatanoo.queries.on(r.success, function(queries) {
        _(queries).each( function (query) { mThis.queries.push(query); } );
        mThis.trigger("change change:queries");
      }, mThis);
    }
  });
  //_.extend(Session, Chatanoo.ValueObject.Session);
  
  return Session;
});