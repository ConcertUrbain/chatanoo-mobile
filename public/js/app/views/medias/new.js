define([
  'backbone',
  'underscore',
  'jquery',
  'chatanoo',

  'config',

  'text!app/templates/medias/show-edit.tmpl.html',
  'text!app/templates/medias/edit.tmpl.html',

  'app/views/app_view'
], function(Backbone, _, $, Chatanoo,
  Config,
  template, editTemplate,
  app_view) {

  var MediaView = Backbone.View.extend(
  {
    tagName: "li",

    model: null,
    editing: false,

    events: {
      //admin
      "click .admin > input[name=validate]": "validateMedia",
      "click .admin > input[name=unvalidate]": "unvalidateMedia",
      "click .admin > input[name=edit]": "editMedia",
      "click .admin > input[name=delete]": "deleteMedia",
      //edit
      "click input[name=file]": "chooseFile",
      "click .edit > input[name=edit]": "validateEditMedia",
      "click .edit > input[name=cancel]": "cancelEditMedia"
    },

    initialize: function() {
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
      this.$el.addClass('video');

      this.$el.html(_.template( (this.editing || _.isUndefined( this.model.get('id') )) ? editTemplate : template, { media: this.model, user: app_view.user, config: Config }));
      this.$el.find('textarea').elastic();

      if( (this.editing || _.isUndefined( this.model.get('id') )) && !Config.isCordova ) {
        var mThis = this;
        this.$el.find("#upload-frame").load( function( event ) {
          mThis.uploadFile.apply(mThis, [event]);
        });
      }

      return this;
    },

    chooseFile: function() {
      var mThis = this;
      var actionSheet = window.plugins.actionSheet;
      actionSheet.create('Choisir...', ['Album', 'Vidéo', 'Photo', 'Audio', 'Annuler'], function(buttonValue, buttonIndex) {
          console.warn('create(), arguments=' + Array.prototype.slice.call(arguments).join(', '));

        if( buttonValue == 'Album') {
          var win = function(imageURI) {
            console.log('Camera: ' + imageURI);
            var m = new MediaFile();
            m.name = imageURI.substring(imageURI.lastIndexOf('/')+1);;
            m.fullPath = imageURI;
            mThis.uploadCordovaFile(m);
          }

          var fail = function(message) {
              alert('Failed because: ' + message);
            app_view.overlay.hide('loading');
          }

          navigator.camera.getPicture(win, fail, {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
          });
          app_view.overlay.show('loading');
        } else {
          mThis.mediaDisptach( buttonValue );
        }
      }, {cancelButtonIndex: 4});
    },

    mediaDisptach: function(type) {
      var mThis = this;

      // capture callback
      var captureSuccess = function(mediaFiles) {
          var i, path, len;
          for (i = 0, len = mediaFiles.length; i < len; i += 1) {
              path = mediaFiles[i].fullPath;
              console.warn('captureSuccess(), path: ' + path);

          mThis.uploadCordovaFile(mediaFiles[i]);
          }
      };

      // capture error callback
      var captureError = function(error) {
          navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
        app_view.overlay.hide('loading');
      };

      switch(type) {
        case "Vidéo":
          // start video capture
          navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:1});
          app_view.overlay.show('loading');
          break;
        case "Photo":
          // start image capture
          navigator.device.capture.captureImage(captureSuccess, captureError, {limit:1});
          app_view.overlay.show('loading');
          break;
        case "Audio":
          navigator.device.capture.captureAudio(captureSuccess, captureError, {limit:2});
          app_view.overlay.show('loading');
          break;
      }
    },

    uploadCordovaFile: function( mediaFile ) {
      var mThis = this;
      var ft = new FileTransfer(),
          path = mediaFile.fullPath,
          name = mediaFile.name;

      var win = function(r) {
          console.log("Code = " + r.responseCode);
          console.log("Response = " + r.response);
          console.log("Sent = " + r.bytesSent);

        mThis.setMediaUrl( r.response );
      }

      var fail = function(error) {
          alert("An error has occurred: Code = " + error.code);
          console.log("upload error source " + error.source);
          console.log("upload error target " + error.target);
      }

        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = name;
      options.mimeType= 'application/octet-stream';

      ft.upload(path, Config.mediasCenter.uploadURL, win, fail, options);
    },

    uploadFile: function( event ) {
      var frame = $(event.currentTarget)[0].contentDocument;
      if( _.isNull( frame ) )
        return;

      if( $('form', frame).length > 0 ) {
        $('input[type=file]', frame).change( function() {
          $('input[type=submit]', frame).click();
          app_view.overlay.show('loading');
        });
      } else {
        var url = $('body', frame).text().trim();
        this.setMediaUrl( url );
      }
    },

    setMediaUrl: function(  url ) {
      var reg = new RegExp("^(MC-[a-zA-Z]+-[PVA])$","g");
      if( reg.test( url ) )
      {
        var videoReg = new RegExp("^(MC-[a-zA-Z]+-V)$","g");
        var pictureReg = new RegExp("^(MC-[a-zA-Z]+-P)$","g");
        var audioReg = new RegExp("^(MC-[a-zA-Z]+-A)$","g");

        var type = null;
        switch( true )
        {
          case videoReg.test( url ):    type = "Vo_Media_Video";  break;
          case pictureReg.test( url ):  type = "Vo_Media_Picture";  break;
          case audioReg.test( url ):    type = "Vo_Media_Sound";  break;
        }

        if( !_.isUndefined( this.model.get('id') ) && this.model.get('__className') != type )
          app_view.overlay.show('error', 3000);
        else {
          this.model.type = type;
          this.$el.find('input[name=url]').val( url );

          switch( type )
          {
            case "Vo_Media_Video":
              this.$el.find('.left img').attr('src', 'http://ms.dring93.org/m/preview/160x120/' + url + '.jpg');
              break;
            case "Vo_Media_Picture":
              this.$el.find('.left img').attr('src', 'http://ms.dring93.org/m/160x120/' + url + '.jpg');
              break;
          }
        }
      }
      else
        app_view.overlay.show('error', 3000);
      this.$el.find("#upload-frame").attr('src', '/upload/upload-iframe.html');
      app_view.overlay.hide('loading');
    },

    //admin
    validateMedia: function() {
      this.model.validateMedia();
    },

    unvalidateMedia: function() {
      this.model.unvalidateMedia();
    },

    editMedia: function() {
      this.editing = true;
      this.render();
    },

    deleteMedia: function() {
      var r = confirm("Voulez vous vraiment supprimer ce média ?");
      if( r ) {
        this.model.deleteMedia();
      }
    },

    //edit
    validateEditMedia: function() {
      this.editing = false;

      var title = this.$el.find('textarea[name=title]').val();
      var description = this.$el.find('textarea[name=description]').val();
      var url = this.$el.find('input[name=url]').val();

      if( _.isUndefined( this.model.get('id') ) ) { // is new
        var klass;
        switch( this.model.type )
        {
          case "Vo_Media_Video":    klass = Chatanoo.ValueObject.Media.Video;   break;
          case "Vo_Media_Picture":  klass = Chatanoo.ValueObject.Media.Picture; break;
          case "Vo_Media_Sound":    klass = Chatanoo.ValueObject.Media.Sound;   break;
        }

        this.model.addMedia( new klass({
          title: title,
          description: description,
          url: url
        }));
      } else {
        this.model.editMedia({
          title: title,
          description: description,
          url: url
        });
      }
    },

    cancelEditMedia: function() {
      this.editing = false;
      this.render();
    },

    kill: function() {
      this.$el.unbind()
      this.model.off();
    }
  });

  return MediaView;
});
