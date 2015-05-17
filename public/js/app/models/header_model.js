define([
  'Backbone',
], function(Backbone) {
  
  var Header = Backbone.Model.extend(
  {
      // Default attributes for the header item.
      defaults: function()
      {
        return {
          title: "Title",
        session: null,
      back: false,
      close: false
        };
      },
  
      initialize: function() 
      {
        if (!this.get("title")) {
          this.set({"title": this.defaults.title});
        this.set({"session": this.defaults.session});
        this.set({"back": this.defaults.back});
      this.set({"close": this.defaults.close});
        }
      }
  });

  return Header;
});