define([
  'Backbone',
  'app/models/query_model'
], function(Backbone, Query) {
  
  var Queries = Backbone.Collection.extend({
      model: Query
  });
  
  return Queries;  
});