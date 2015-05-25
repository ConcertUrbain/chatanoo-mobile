define([
  'backbone',
  'underscore',
  'jquery',

  'app/models/query_model',

  'text!app/templates/query/show.tmpl.html',
  'text!app/templates/query/error.tmpl.html',

  'app/views/app_view'
], function(Backbone, _, $,
  Query,
  template, error,
  app_view) {

  var QueryView = Backbone.View.extend(
  {
    el: $("#wrapper"),

    model: null,

    events: {
      "click .contribute input[name=add-item]": "addItem",
      //admin
      "click .admin input[name=validate]": "validateQuery",
      "click .admin input[name=unvalidate]": "unvalidateQuery",
      "click .admin input[name=edit]": "editQuery",
      "click .admin input[name=delete]": "deleteQuery"
    },

    initialize: function() {
      this.model = new Query();
      this.model.on("change", this.render, this);

      this.model.on("change:validate change:unvalidate", function() {
        app_view.overlay.show('valid', 3000);
      }, this);

      this.model.on("delete", function() {
        app_view.overlay.show('valid', 2000);

        setTimeout( function() {
          location.hash = '/session';
          app_view.gotoSession();
        }, 2000);
      }, this);
      },

    render: function() {
      this.$el.removeClass().addClass('query-view');

      if( !this.model.isOnError ) {
        if( this.model.get('content') )
          app_view.header.model.set('title', this.model.get('content') );
        this.$el.html( _.template( template, { query: this.model, user: app_view.user } ) );
      }
      else {
        app_view.header.model.set('title', 'Erreur' );
        this.$el.html( _.template( error, {} ) );
      }
      return this;
    },

    addItem: function() {
      location.hash = "/queries/" + this.model.get( 'id' ) + "/items/new";
    },

    validateQuery: function() {
      this.model.validateQuery();
    },

    unvalidateQuery: function() {
      this.model.unvalidateQuery();
    },

    editQuery: function() {
      location.hash = "/queries/" + this.model.get( 'id' ) + "/edit";
      //app_view.gotoEditQuery( this.model.get( 'id' ) );
    },

    deleteQuery: function() {
      var r = confirm("Voulez vous vraiment supprimer cette question ?");
      if( r ) {
        this.model.deleteQuery();
      }
    },

    kill: function() {
      this.$el.unbind()
      this.model.off();
    }
  });

  return QueryView;
});
