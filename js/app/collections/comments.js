define([
	'Backbone',
	'app/models/comment_model'
], function(Backbone, Comment) {

	var Comments = Backbone.Collection.extend({
    	model: Comment
	});
	
	return Comments;
});