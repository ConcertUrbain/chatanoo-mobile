define([
  'backbone',
  'underscore',
  'jquery',

  'text!app/templates/comment/show.tmpl.html',
  'text!app/templates/comment/edit.tmpl.html',

  'app/views/app_view'
], function(Backbone, _, $,
  template, editTemplate,
  app_view) {

  var CommentView = Backbone.View.extend(
  {
    tagName: "li",

    model: null,
    editing: false,

    events: {
      //admin
      "click .admin > input[name=validate]": "validateComment",
      "click .admin > input[name=unvalidate]": "unvalidateComment",
      "click .admin > input[name=edit]": "editComment",
      "click .admin > input[name=delete]": "deleteComment",
      //edit
      "click .edit > input[name=edit]": "validateEditComment",
      "click .edit > input[name=cancel]": "cancelEditComment"
    },

    initialize: function() {
      //this.model = new Item();
      this.model.on("change", this.render, this);

      this.model.on("change:validate change:unvalidate edited", function() {
        app_view.overlay.show('valid', 3000);
      }, this);

      this.model.on("delete", function() {
        app_view.overlay.show('valid', 2000);

        this.kill();
        this.$el.remove();
      }, this);
      },

    render: function() {
      this.$el.removeClass();
      if (this.model.rate > 0)
        this.$el.addClass("like");
      else if (this.model.rate < 0)
        this.$el.addClass("unlike");

      this.$el.html(_.template(this.editing ? editTemplate : template, { comment: this.model, user: app_view.user }));
      this.$el.find('textarea').elastic();

      return this;
    },

    //admin
    validateComment: function() {
      this.model.validateComment();
    },

    unvalidateComment: function() {
      this.model.unvalidateComment();
    },

    editComment: function() {
      this.editing = true;
      this.render();
    },

    deleteComment: function() {
      var r = confirm("Voulez vous vraiment supprimer cette contribution ?");
      if( r ) {
        this.model.deleteComment();
      }
    },

    //edit
    validateEditComment: function() {
      this.editing = false;
      this.model.editComment({
        content: this.$el.find('textarea').val()
      });
    },

    cancelEditComment: function() {
      this.editing = false;
      this.render();
    },

    kill: function() {
      this.$el.unbind()
      this.model.off();
    }
  });

  return CommentView;
});
