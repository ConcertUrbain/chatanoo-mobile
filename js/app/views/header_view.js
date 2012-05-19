define([
	'Backbone',
	'Underscore',
	'jQuery',
	
	'text!app/templates/header.tmpl.html'
], function(Backbone, _, $,
	template) {
	
	var HeaderView = Backbone.View.extend(
	{
		el: $("header"),
		
		model: null,
		
		initialize: function() 
	    {
	    	this.model.on("change", this.render, this);
	    },
		
		render: function() 
		{
			this.$el.removeClass();
			if(this.model.get("section"))
				this.$el.addClass(this.model.get("section"));
			this.$el.html( _.template( template, this.model ? this.model.toJSON() : {} ) );
			
			return this;
		},

		kill: function() {
			this.$el.unbind()
			this.model.off();
		}
	});
	
	return HeaderView;
});