define([], function() {
  return {
    chatanoo: {
      // url: 'http://preprod.ws.dring93.org/services',
      // api_key: 'MJC94_5f86d751cf83daecf09c4493e8',
      url: '${WS_URL}',
      api_key: 'a24j2sW2ueaadyy9462EQF3dc3BUZUje',
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