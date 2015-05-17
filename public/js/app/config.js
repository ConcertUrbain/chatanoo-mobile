define([
  'json!https://s3-eu-west-1.amazonaws.com/chatanoo-cdn/config.json'
], function(config) {
  return {
    chatanoo: {
      url: '${WS_URL}',
      sessions: config.api_key,

      anonymous_user: {
        login: "anonymous",
        pass: "anonymous"
      }
    },
    mediasCenter: {
      url: "http://ms.dring93.org/",
      uploadURL: "http://ms.dring93.org/upload"
    },
    isCordova: false,
    platform: "web"
  }
});
