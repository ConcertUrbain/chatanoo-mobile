define([
  'Backbone',
  'Underscore',
  'jQuery',
  'Chatanoo',

  'app/models/query_model',

  'text!app/templates/query/new.tmpl.html',

  'app/views/app_view'
], function(Backbone, _, $, Chatanoo,
  Query,
  template,
  app_view) {

  var QueryView = Backbone.View.extend(
  {
    el: $("#wrapper"),

    model: new Query(),
    mode: "new",

    events: {
      "submit #query-form": "createOrEditQuery"
    },

    initialize: function() {
      this.model = new Query();
      this.model.on("change", this.render, this);

      this.model.on("added edited", function() {
        app_view.overlay.show('valid', 2000);

        var mThis = this;
        setTimeout( function() {
          location.hash = "/queries/" + mThis.model.get( 'id' );
          //app_view.gotoQuery( mThis.model.get( 'id' ) );
        }, 2000);
      }, this);
      },

    render: function() {
      this.$el.removeClass().addClass('query-view');

      this.$el.html( _.template( template, { query: this.model, user: app_view.user, mode: this.mode } ) );
      this.$el.find('textarea').elastic();

      return this;
    },

    createOrEditQuery: function( event ) {
      event.preventDefault();

      var content = this.$el.find('#query-form textarea[name=content]').val();
      var description = this.$el.find('#query-form textarea[name=description]').val();

      switch( this.mode )
      {
        case "new":
          this.model.addQuery(new Chatanoo.ValueObject.Query({
            content: content,
            description: description
          }));
          break;
        case "edit":
          this.model.editQuery({
            content: content,
            description: description
          });
          break;
      }

      return false;
    },

    kill: function() {
      this.$el.unbind()
      this.model.off();
    }
  });

  return QueryView;
});
