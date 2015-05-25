define([
  'backbone',
  'underscore',
  'jquery',

  'app/models/session_model',

  'text!app/templates/session.tmpl.html',

  'app/views/app_view'
], function(Backbone, _, $,
  Session,
  template,
  app_view) {

  var SessionView = Backbone.View.extend(
  {
    el: $("#wrapper"),

    model: null,

    events: {
      "click .contribute input[name=add-query]": "addQuery",
    },

    initialize: function() {
      this.model = new Session();
      this.model.on("change", this.render, this);
      },

    render: function() {
      this.$el.removeClass().addClass('session-view');
      this.$el.html( _.template( template, { session: this.model, user: app_view.user } ) );
      return this;
    },

    addQuery: function() {
      location.hash = "/queries/new";
      //app_view.gotoAddQuery();
    },

    kill: function() {
      this.$el.unbind()
      this.model.off();
    }
  });

  return SessionView;
});
