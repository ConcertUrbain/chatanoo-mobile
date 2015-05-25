define([
  'backbone',
  'underscore',
  'jquery',
  'chatanoo',
  'moment',

  'app/models/item_model',

  'app/views/medias/new',

  'text!app/templates/item/new.tmpl.html',

  'app/views/app_view'
], function(Backbone, _, $, Chatanoo, moment,
  Item,
  MediaView,
  template,
  app_view) {

  var QueryView = Backbone.View.extend(
  {
    el: $("#wrapper"),

    model: new Item(),
    mode: "new",

    events: {
      "click input[name=add-media]": "addMedia",
      "submit #item-form": "createOrEditItem"
    },

    initialize: function() {
      this.model = new Item();
      this.model.on("change", this.render, this);

      this.model.on("added edited", function() {
        app_view.overlay.show('valid', 2000);

        var mThis = this;
        setTimeout( function() {
          location.hash = "/queries/" + mThis.model.get( 'query_id' ) + "/items/" + mThis.model.get( 'id' );
          //app_view.gotoQuery( mThis.model.get( 'id' ) );
        }, 2000);
      }, this);
      },

    render: function() {
      this.$el.removeClass().addClass('item-view');

      this.$el.html( _.template( template, { item: this.model, user: app_view.user, mode: this.mode } ) );
      this.$el.find('textarea').elastic();

      var els = [];
      var ordered = this.model.medias.sortBy( function(media) { return media.get("addDate").valueOf(); } );
      _(ordered).each( function (media) {
        var cv = new MediaView( { model: media } );
        els.push( cv.render().el );
      });
      this.$el.find(".medias").prepend( els );

      return this;
    },

    addMedia: function() {
      this.model.medias.push( new Chatanoo.ValueObject.Media.Video({
        title: null,
        description: null,
        url: null,
        addDate: moment(),
        item_id: this.model.get( 'id' )
      }));
      this.render();
    },

    createOrEditItem: function( event ) {
      event.preventDefault();

      var title = this.$el.find('#item-form textarea[name=title]').val();
      var description = this.$el.find('#item-form textarea[name=description]').val();

      switch( this.mode )
      {
        case "new":
          this.model.addItem(new Chatanoo.ValueObject.Item({
            title: title,
            description: description
          }));
          break;
        case "edit":
          this.model.editItem({
            title: title,
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
