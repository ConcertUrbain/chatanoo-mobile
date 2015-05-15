define([
	'Backbone',
	'app/models/item_model'
], function(Backbone, Item) {
	
	var Items = Backbone.Collection.extend({
    	model: Item
	});
	
	return Items
});