define([
  'Backbone',
  'Underscore',
  'jQuery',

  'Config',

  'text!app/templates/header.tmpl.html'
], function(Backbone, _, $,
  Config,
  template) {

  var HeaderView = Backbone.View.extend(
  {
    el: $("header"),

    model: null,

    events: {
      'click input[name=logout]': 'logout'
    },

    initialize: function()
      {
        this.model.on("change", this.render, this);
      },

    render: function()
    {
      this.$el.removeClass();
      if(this.model.get("section"))
        this.$el.addClass(this.model.get("section"));
      this.$el.html( _.template( template, { model: this.model ? this.model.toJSON() : {}, config: Config } ) );

      return this;
    },

    logout: function() {
      this.trigger('logout');
    },

    kill: function() {
      this.$el.unbind()
      this.model.off();
    }
  });

  return HeaderView;
});
