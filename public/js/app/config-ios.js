define([
  "underscore",
  "app/config"
], function( _, Config ) {

  var ios = _.extend(Config, {
    isCordova: true,
    platform: "ios"
  });

  return ios;
});
