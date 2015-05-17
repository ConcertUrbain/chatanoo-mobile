define([
  'Backbone',
  'app/models/meta_model'
], function(Backbone, Meta) {

  var Metas = Backbone.Collection.extend({
      model: Meta
  });
  
  return Metas;
});