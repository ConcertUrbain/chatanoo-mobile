define([
	'jQuery',
	'Underscore',
	'Backbone',
	
	'app/helpers/spinner',
	
	'text!app/templates/overlay.tmpl.html'
], function($, _, Backbone,
	Spinner,
	template) {
	
	var OverlayView = Backbone.View.extend({
		count: {},
		
		initialize: function() {
			this.render();
			
			this.count["loading"] = 1;
			
			if( !_.isNull(Spinner) ) {
				Spinner.init("spinner", 12, 20, 12, 4, "#FFF");
			}
	    },
		
		render: function() {
			this.$el.html( _.template( template, {} ) );
			return this;
		},
		
		show: function(type, duration) {
			var _self = this;
			
			if( _.isUndefined( this.count[type] ) )
				this.count[type] = 0;
			this.count[type]++;
			
			_self.$el.show();
			//_self.$el.find('> div').hide();
			
			_self.$el.find('div#' + type).show();
			if( !_.isUndefined(duration) ) {
				setTimeout( function() {
					_self.hide(type);
				}, duration);
			}
		},
		
		hide: function(type) {
			if( _.isUndefined( this.count[type] ) )
				this.count[type] = 0;
			this.count[type]--;
			
			if(this.count[type] > 0)
				return;
		
			var sum = _(this.count).reduce( function(memo, num) { return memo + num; } );
			if( sum <= 0 )
				this.$el.hide();
				
			if( _.isUndefined(type) )
				this.$el.find('> div').hide();
			else
				this.$el.find('div#' + type).hide();
		},
	});
	
	return OverlayView;
});