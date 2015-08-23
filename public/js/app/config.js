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
      url: "http://medias.aws.chatanoo.org",
      inputBucket: "chatanoo-medias-input",
      identityPoolId: 'eu-west-1:b263aeab-02ae-4268-b338-95e7ea79e255',
      region: 'eu-west-1',
      uploadURL: "http://ms.dring93.org/upload"
    },
    isCordova: false,
    platform: "web"
  }
});
