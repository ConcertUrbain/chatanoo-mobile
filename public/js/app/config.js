define([
  'jquery',
  'json!env.json'
], function($, env) {
  return {
    load: function(callback) {
      var _this = this;
      $.getJSON(env.API_KEYS, function(data) {
        _this.chatanoo.sessions = data.api_key;
        callback(null);
      })
    },
    chatanoo: {
      url: env.WS_URL,
      sessions: env.API_KEYS,

      anonymous_user: {
        login: "anonymous",
        pass: "anonymous"
      }
    },
    mediasCenter: {
      url: env.MEDIAS_CENTER.url,
      inputBucket: env.MEDIAS_CENTER.input_bucket,
      identityPoolId: env.MEDIAS_CENTER.identity_pool,
      region: env.MEDIAS_CENTER.region,
      uploadURL: env.MEDIAS_CENTER.upload_url
    },
    isCordova: false,
    platform: "web"
  }
});
