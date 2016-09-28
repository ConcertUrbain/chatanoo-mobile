define([
  'json!env.json'
], function(env) {
  return {
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
