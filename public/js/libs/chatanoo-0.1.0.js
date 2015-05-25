//     Chatanoo.js 0.1.0

//     (c) 2010-2012 Mathieu Desvé, Concert Urbain.
//     Chatanoo may be freely distributed under the MIT license.

(function()
{
  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `global`
  // on the server).
  var root = this;

   // Save the previous value of the `Backbone` variable, so that it can be
   // restored later on, if `noConflict` is used.
    var previousChatanoo = root.Chatanoo;

    // Create a local reference to slice/splice.
  var slice = Array.prototype.slice;
  var splice = Array.prototype.splice;

  var Chatanoo;
  if (typeof exports !== 'undefined') {
    Chatanoo = exports;
  } else {
    Chatanoo = root.Chatanoo = {};
  }

  Chatanoo.VERSION = "0.1.0";

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  Chatanoo.noConflict = function() {
      root.Chatanoo = previousChatanoo;
      return this;
  };

  // Global variables
  // ----------------
  Chatanoo.baseurl = null;
  Chatanoo.apiKey = null;
  Chatanoo.sessionKey = null;

  // Global methods
  // --------------
  Chatanoo.init = function(baseurl, apiKey) {
    Chatanoo.baseurl = baseurl;
    Chatanoo.apiKey = apiKey;

    // Init services
    Chatanoo.connection =   new Chatanoo.Service.Connection(baseurl + "/connection/json");
    Chatanoo.comments =   new Chatanoo.Service.Comments(baseurl + "/comments/json");
    Chatanoo.datas =     new Chatanoo.Service.Datas(baseurl + "/datas/json");
    Chatanoo.items =     new Chatanoo.Service.Items(baseurl + "/items/json");
    Chatanoo.medias =     new Chatanoo.Service.Medias(baseurl + "/medias/json");
    Chatanoo.plugins =     new Chatanoo.Service.Plugins(baseurl + "/plugins/json");
    Chatanoo.queries =     new Chatanoo.Service.Queries(baseurl + "/queries/json");
    Chatanoo.search =     new Chatanoo.Service.Search(baseurl + "/search/json");
    Chatanoo.sessions =   new Chatanoo.Service.Sessions(baseurl + "/sessions/json");
    Chatanoo.users =     new Chatanoo.Service.Users(baseurl + "/users/json");
  };

  Chatanoo.connect = function(login, pass) {
    Chatanoo.sessionKey = null;
    Chatanoo.connection.on('connect:success', function(sessionKey) {
      Chatanoo.trigger('connect connect:success', sessionKey);
    }, this);
    Chatanoo.connection.on('connect:error', function() {
      Chatanoo.trigger('connect:error');
    }, this);
    Chatanoo.connection.connect(login, pass);
  };

  Chatanoo.disconnect = function() {

  };


  // Regular expression used to split event strings
  var eventSplitter = /\s+/;

  // Backbone implementation off events
  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback functions
  // to an event; trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Chatanoo.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Chatanoo.Events = {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {

      var calls, event, node, tail, list;
      if (!callback) return this;
      events = events.split(eventSplitter);
      calls = this._callbacks || (this._callbacks = {});

      // Create an immutable callback list, allowing traversal during
      // modification.  The tail is an empty object that will always be used
      // as the next node.
      while (event = events.shift()) {
        list = calls[event];
        node = list ? list.tail : {};
        node.next = tail = {};
        node.context = context;
        node.callback = callback;
        calls[event] = {tail: tail, next: list ? list.next : node};
      }

      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var event, calls, node, tail, cb, ctx;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) return;
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      // Loop through the listed events and contexts, splicing them out of the
      // linked list of callbacks if appropriate.
      events = events ? events.split(eventSplitter) : _.keys(calls);
      while (event = events.shift()) {
        node = calls[event];
        delete calls[event];
        if (!node || !(callback || context)) continue;
        // Create a new list, omitting the indicated callbacks.
        tail = node.tail;
        while ((node = node.next) !== tail) {
          cb = node.callback;
          ctx = node.context;
          if ((callback && cb !== callback) || (context && ctx !== context)) {
            this.on(event, cb, ctx);
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(events) {
      var event, node, calls, tail, args, all, rest;
      if (!(calls = this._callbacks)) return this;
      all = calls.all;
      events = events.split(eventSplitter);
      rest = slice.call(arguments, 1);

      // For each event, walk through the linked list of callbacks twice,
      // first to trigger the event, then to trigger any `"all"` callbacks.
      while (event = events.shift()) {
        if (node = calls[event]) {
          tail = node.tail;
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, rest);
          }
        }
        if (node = all) {
          tail = node.tail;
          args = [event].concat(rest);
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, args);
          }
        }
      }

      return this;
    }

  };

  // --------
  // SERVICES
  // --------

  Chatanoo.Service = {};

  // Abstract Objects
  // ----------------

  var AbstractService = Chatanoo.Service.Abstract = {
    url: null,

    initialize: function(url) {
      this.url = url;
    },

    getRequest: function(method, data, options) {
      options = options || {};

      var mThis = this;
      var d = {
        params: this.prepareData( data ),
        id: _.uniqueId(method),
        method: method,
      }
      var a = {
        url: this.url,
        type: "POST",
        data: JSON.stringify(d),
        cache : false,
        dataType: "json",
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", Chatanoo.sessionKey);
        },
        success: function(response) {
          Chatanoo.trigger('finish');
          mThis.trigger('finish ' + method + ':finish ' + method + ':finish:' + d.id);
          if( response.result !== false && !_.isNull(response.result) && !_.isUndefined(response.result) )
            mThis.trigger(method + ' ' + method + ':success ' + method + ':success:' + d.id, mThis.jsonToValueObject(response.result));
          else
            mThis.trigger('error ' + method + ':error ' + method + ':error:' + d.id);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          Chatanoo.trigger('finish');
          console.log('Error: ' + jqXHR + ' (message: ' + textStatus + ' statusCode: ' + jqXHR.status + ' error: ' + errorThrown + ' session: ' + Chatanoo.sessionKey + ' url: ' + mThis.url + ' data: ' + JSON.stringify(d) + ')');
          mThis.trigger('error ' + method + ':error ' + method + ':error:' + d.id);
        }
      };
      _.extend(a, options);

      Chatanoo.trigger('loading');
      this.trigger('loading ' + method + ':loading ' + method + ':loading:' + d.id);
      $.ajax(a);

      return {
        success: method + ':success:' + d.id,
        error: method + ':error:' + d.id,
      };
    },

    prepareData: function(data) {
      for(prop in data) {
        switch(true)
        {
          case moment.isMoment(data[prop]):
            data[prop] = data[prop].format("YYYY.MM.DD HH:mm:ss");
            break;
          case data[prop] instanceof Object:
            data[prop] = this.prepareData( data[prop] );
            break;
        }
      }
      return data;
    },

    jsonToValueObject: function(json) {
      switch(true)
      {
        case _.isObject(json):
          var vo;
          var klass;
          switch(json.__className) {
            case "Vo_Item":       klass = Chatanoo.ValueObject.Item;       break;
            case "Vo_Meta":       klass = Chatanoo.ValueObject.Meta;       break;
            case "Vo_Query":       klass = Chatanoo.ValueObject.Query;     break;
            case "Vo_Session":       klass = Chatanoo.ValueObject.Session;     break;
            case "Vo_Comment":       klass = Chatanoo.ValueObject.Comment;     break;
            case "Vo_User":       klass = Chatanoo.ValueObject.User;       break;

            case "Vo_Data_Adress":     klass = Chatanoo.ValueObject.Data.Address;   break;
            case "Vo_Data_Carto":     klass = Chatanoo.ValueObject.Data.Carto;   break;
            case "Vo_Data_Vote":     klass = Chatanoo.ValueObject.Data.Vote;   break;

            case "Vo_Media_Picture":   klass = Chatanoo.ValueObject.Media.Picture; break;
              case "Vo_Media_Sound":     klass = Chatanoo.ValueObject.Media.Sound;   break;
            case "Vo_Media_Text":     klass = Chatanoo.ValueObject.Media.Text;   break;
            case "Vo_Media_Video":     klass = Chatanoo.ValueObject.Media.Video;   break;
          }

          if(!klass) {
            var cat = {};
            _(json).each( function(obj, key) { cat[key] = this.jsonToValueObject(obj); }, this );
            return cat;
          }

          vo = new klass(json);

          return vo;

        case _.isArray(json):
          return _(json).map(this.jsonToValueObject);

        default:
          return json;
      }
    }
  }

  // Concrete services
  // -----------------

  // Connection
  var Connection = Chatanoo.Service.Connection = function (url) {
    this.initialize(url);
  }

  _.extend(Connection.prototype, AbstractService, Events, {
    connect: function(login, pass) {
      var mThis = this;
      var data = {
        "params": [login, pass, Chatanoo.apiKey],
        "id": _.uniqueId(),
        "method": "login"
      }

      Chatanoo.trigger('loading');
      $.ajax({
        url: this.url,
        type: "POST",
        data: JSON.stringify(data),
        dataType: "json",
        success: function(response) {
          Chatanoo.trigger('finish');
          if(response.result !== false)
          {
            Chatanoo.sessionKey = response.result;
            console.log("chatanoo: service connected (" + Chatanoo.sessionKey + ")");
            mThis.trigger('connect connect:success', Chatanoo.sessionKey);
          }
          else
          {
            console.log("chatanoo: connection error");
            mThis.trigger('connect:error');
          }
        },
        error: function() {
          Chatanoo.trigger('finish');
        }
      });
    },
    getCurrentUser: function() {
      return this.getRequest("getCurrentUser", {});
    }
  });

  // Comments
  var Comments = Chatanoo.Service.Comments = function (url) {
    this.initialize(url);
  }

  _.extend(Comments.prototype, AbstractService, Events, {
    getComments: function(options) {
      options = options || [];
      return this.getRequest("getQueries", options);
    },
    getCommentById: function(commentId) {
      args = [commentId];
      return this.getRequest("getCommentById", args);
    },
    getCommentsByItemId: function(itemId) {
      args = [itemId];
      return this.getRequest("getCommentsByItemId", args);
    },
    addComment: function(comment) {
      args = [comment];
      return this.getRequest("addComment", args);
    },
    setComment: function(comment) {
      args = [comment];
      return this.getRequest("setComment", args);
    },
    setItemOfComment: function(comment, itemId) {
      args = [comment, itemId];
      return this.getRequest("setItemOfComment", args);
    },
    deleteComment: function(commentId) {
      args = [commentId];
      return this.getRequest("deleteComment", args);
    },
    getUserFromVo: function(voId) {
      args = [voId];
      return this.getRequest("getUserFromVo", args);
    },
    setUserOfVo: function(userId, voId) {
      args = [userId, voId];
      return this.getRequest("setUserOfVo", args);
    },
    validateVo: function(voId, trueOrFalse, all) {
      if(!all) all = false;
      args = [voId, trueOrFalse, all];
      return this.getRequest("validateVo", args);
    },
    addDataIntoVo: function(data, voId) {
      args = [data, voId];
      return this.getRequest("addDataIntoVo", args);
    },
    addVoteIntoItemPatch: function(rate, userId, commentId) {
      args = [rate, userId, commentId];
      return this.getRequest("addVoteIntoItemPatch", args);
    },
    removeDataFromVo: function(dataId, dataType, voId) {
      args = [dataId, dataType, voId];
      return this.getRequest("removeDataFromVo", args);
    }
  });

  // Datas
  var Datas = Chatanoo.Service.Datas = function (url) {
    this.initialize(url);
  }

  _.extend(Datas.prototype, AbstractService, Events, {
    getDatas: function(options) {
      options = options || [];
      return this.getRequest("getDatas", options);
    },
    getDataById: function(dataId, dataType) {
      args = [dataId, dataType];
      return this.getRequest("getDataById", args);
    },
    getDatasByItemId: function(itemId) {
      args = [itemId];
      return this.getRequest("getDatasByItemId", args);
    },
    getDatasByCommentId: function(commentId) {
      args = [commentId];
      return this.getRequest("getDatasByCommentId", args);
    },
    getDatasByMediaId: function(mediaId, mediaType) {
      args = [mediaId, mediaType];
      return this.getRequest("getDatasByMediaId", args);
    },
    getDatasByUserId: function(userId) {
      args = [userId];
      return this.getRequest("getDatasByUserId", args);
    },
    getDatasByQueryId: function(queryId) {
      args = [queryId];
      return this.getRequest("getDatasByQueryId", args);
    },
    addData: function(data) {
      args = [data];
      return this.getRequest("addData", args);
    },
    setData: function(data) {
      args = [data];
      return this.getRequest("setData", args);
    },
    deleteData: function(dataId, dataType) {
      args = [dataId, dataType];
      return this.getRequest("deleteData", args);
    }
  });

  // Items
  var Items = Chatanoo.Service.Items = function (url) {
    this.initialize(url);
  }

  _.extend(Items.prototype, AbstractService, Events, {
    getItems: function(options) {
      options = options || [];
      return this.getRequest("getItems", options);
    },
    getItemById: function(itemId) {
      args = [itemId];
      return this.getRequest("getItemById", args);
    },
    getItemsByQueryId: function(queryId) {
      args = [queryId];
      return this.getRequest("getItemsByQueryId", args);
    },
    addItem: function(item) {
      args = [item];
      return this.getRequest("addItem", args);
    },
    setItem: function(item) {
      args = [item];
      return this.getRequest("setItem", args);
    },
    deleteItem: function(itemId) {
      args = [itemId];
      return this.getRequest("deleteItem", args);
    },
    addCommentIntoItem: function(comment, itemId) {
      args = [comment, itemId];
      return this.getRequest("addCommentIntoItem", args);
    },
    addCommentIntoItemPatch: function(contentOfComment, itemId) {
      args = [contentOfComment, itemId];
      return this.getRequest("addCommentIntoItemPatch", args);
    },
    removeCommentFromItem: function(commentId, itemId) {
      args = [commentId, itemId];
      return this.getRequest("removeCommentFromItem", args);
    },
    addMediaIntoItem: function(media, itemId) {
      args = [media, itemId];
      return this.getRequest("addMediaIntoItem", args);
    },
    removeMediaFromItem: function(mediaId, mediaType, itemId) {
      args = [mediaId, mediaType, itemId];
      return this.getRequest("removeMediaFromItem", args);
    },
    validateVo: function(voId, trueOrFalse, all) {
      if(!all) all = false;
      args = [voId, trueOrFalse, all];
      return this.getRequest("validateVo", args);
    },
    addMetaIntoVo: function(meta, voId) {
      args = [meta, voId];
      return this.getRequest("addMetaIntoVo", args);
    },
    removeMetaFromVo: function(metaId, voId) {
      args = [metaId, voId];
      return this.getRequest("removeMetaFromVo", args);
    },
    getUserFromVo: function(voId) {
      args = [voId];
      return this.getRequest("getUserFromVo", args);
    },
    setUserOfVo: function(userId, voId) {
      args = [userId, voId];
      return this.getRequest("setUserOfVo", args);
    },
    getVosByUserId: function(userId) {
      args = [userId];
      return this.getRequest("getVosByUserId", args);
    },
    addDataIntoVo: function(data, voId) {
      args = [data, voId];
      return this.getRequest("addDataIntoVo", args);
    },
    removeDataFromVo: function(dataId, dataType, voId) {
      args = [dataId, dataType, voId];
      return this.getRequest("removeDataFromVo", args);
    },
    getRateOfItem: function(itemId) {
      args = [itemId];
      return this.getRequest("getRateOfItem", args);
    }
  });

  // Medias
  var Medias = Chatanoo.Service.Medias = function (url) {
    this.initialize(url);
  }

  _.extend(Medias.prototype, AbstractService, Events, {
    getMedias: function(options) {
      options = options || [];
      return this.getRequest("getMedias", options);
    },
    getMediaById: function(mediaId, mediaType) {
      args = [mediaId, mediaType];
      return this.getRequest("getMediaById", args);
    },
    getMediasByItemId: function(itemId) {
      args = [itemId];
      return this.getRequest("getMediasByItemId", args);
    },
    getMediasByQueryId: function(queryId) {
      args = [queryId];
      return this.getRequest("getMediasByQueryId", args);
    },
    addMedia: function(media) {
      args = [media];
      return this.getRequest("addMedia", args);
    },
    setMedia: function(dataId, dataType) {
      args = [dataId, dataType];
      return this.getRequest("setMedia", args);
    },
    deleteMedia: function(mediaId, mediaType) {
      args = [mediaId, mediaType];
      return this.getRequest("deleteMedia", args);
    },
    getUserFromMedia: function(mediaId, mediaType) {
      args = [mediaId, mediaType];
      return this.getRequest("getUserFromMedia", args);
    },
    setUserOfMedia: function(userId, mediaId, mediaType) {
      args = [userId, mediaId, mediaType];
      return this.getRequest("setUserOfMedia", args);
    },
    getMediasByUserId: function(userId) {
      args = [userId];
      return this.getRequest("getMediasByUserId", args);
    },
    addMetaIntoMedia: function(meta, mediaId, mediaType) {
      args = [meta, mediaId, mediaType];
      return this.getRequest("addMetaIntoMedia", args);
    },
    removeMetaFromMedia: function(metaId, mediaId, mediaType) {
      args = [metaId, mediaId, mediaType];
      return this.getRequest("removeMetaFromMedia", args);
    },
    validateMedia: function(mediaId, mediaType, trueOrFalse) {
      args = [mediaId, mediaType, trueOrFalse];
      return this.getRequest("validateMedia", args);
    },
    addDataIntoMedia: function(data, mediaId, mediaType) {
      args = [data, mediaId, mediaType];
      return this.getRequest("addDataIntoMedia", args);
    },
    removeDataFromMedia: function(dataId, dataType, mediaId, mediaType) {
      args = [dataId, dataType, mediaId, mediaType];
      return this.getRequest("removeDataFromMedia", args);
    }
  });

  // Plugins
  var Plugins = Chatanoo.Service.Plugins = function (url) {
    this.initialize(url);
  }

  _.extend(Plugins.prototype, AbstractService, Events, {
    call: function(name, params) {
      args = [name, params];
      return this.getRequest("getDatas", args);
    }
  });

  // Queries
  var Queries = Chatanoo.Service.Queries = function (url) {
    this.initialize(url);
  }

  _.extend(Queries.prototype, AbstractService, Events, {
      getQueries: function(options) {
      options = options || [];
      return this.getRequest("getQueries", options);
    },
    getQueryById: function(queryId) {
      args = [queryId];
      return this.getRequest("getQueryById", args);
    },
    getQueriesBySessionId: function(sessionId) {
      args = [sessionId];
      return this.getRequest("getQueriesBySessionId", args);
    },
    getQueriesByItemId: function(itemId) {
      args = [itemId];
      return this.getRequest("getQueriesByItemId", args);
    },
    addQuery: function(query) {
      args = [query];
      return this.getRequest("addQuery", args);
    },
    setQuery: function(query) {
      args = [query];
      return this.getRequest("setQuery", args);
    },
    deleteQuery: function(queryId) {
      args = [queryId];
      return this.getRequest("deleteQuery", args);
    },
    addItemIntoQuery: function(item, queryId) {
      args = [item, queryId];
      return this.getRequest("addItemIntoQuery", args);
    },
    removeItemFromQuery: function(itemId, queryId) {
      args = [itemId, queryId];
      return this.getRequest("removeItemFromQuery", args);
    },
    addMediaIntoQuery: function(media, mediaType, queryId) {
      args = [media, mediaType, queryId];
      return this.getRequest("addMediaIntoQuery", args);
    },
    removeMediaFromQuery: function(mediaId, mediaType) {
      args = [mediaId, mediaType];
      return this.getRequest("removeMediaFromQuery", args);
    },
    addMetaIntoVo: function(meta, voId) {
      args = [meta, voId];
      return this.getRequest("addMetaIntoVo", args);
    },
    removeMetaFromVo: function(metaId, voId) {
      args = [metaId, voId];
      return this.getRequest("removeMetaFromVo", args);
    },
    getUserFromVo: function(voId) {
      args = [voId];
      return this.getRequest("getUserFromVo", args);
    },
    setUserOfVo: function(userId, voId) {
      args = [userId, voId];
      return this.getRequest("setUserOfVo", args);
    },
    getVosByUserId: function(userId) {
      args = [userId];
      return this.getRequest("getVosByUserId", args);
    },
    validateVo: function(voId, trueOrFalse, all) {
      if(!all) all = false;
      args = [voId, trueOrFalse, all];
      return this.getRequest("validateVo", args);
    },
    addDataIntoVo: function(data, voId) {
      args = [data, voId];
      return this.getRequest("addDataIntoVo", args);
    },
    removeDataFromVo: function(dataId, dataType, voId) {
      args = [dataId, dataType, voId];
      return this.getRequest("removeDataFromVo", args);
    }
  });

  // Search
  var Search = Chatanoo.Service.Search = function (url) {
    this.initialize(url);
  }

  _.extend(Search.prototype, AbstractService, Events, {
    getMetas: function(options) {
      options = options || [];
      return this.getRequest("getMetas", options);
    },
    getMetasByVo: function(voId, voType) {
      args = [voId, voType];
      return this.getRequest("getMetasByVo", args);
    },
    getMetaById: function(metaId) {
      args = [metaId];
      return this.getRequest("getMetaById", args);
    },
    getMetaByContent: function(metaContent) {
      args = [metaContent];
      return this.getRequest("getDataById", args);
    },
    addMeta: function(meta) {
      args = [meta];
      return this.getRequest("addMeta", args);
    },
    setMeta: function(meta) {
      args = [meta];
      return this.getRequest("setMeta", args);
    },
    deleteMeta: function(metaId) {
      args = [metaId];
      return this.getRequest("deleteMeta", args);
    },
    search: function(request, section) {
      section = section || "Default";
      args = [request, section];
      return this.getRequest("search", args);
    }
  });

  // Sessions
  var Sessions = Chatanoo.Service.Sessions = function (url) {
    this.initialize(url);
  }

  _.extend(Sessions.prototype, AbstractService, Events, {
    getSessions: function(options) {
      options = options || [];
      return this.getRequest("getSessions", options);
    },
    getSessionById: function(sessionId) {
      args = [sessionId];
      return this.getRequest("getSessionById", args);
    },
    getSessionsByQueryId: function(queryId) {
      args = [queryId];
      return this.getRequest("getSessionsByQueryId", args);
    },
    addSession: function(session) {
      args = [session];
      return this.getRequest("addSession", args);
    },
    setSession: function(session) {
      args = [session];
      return this.getRequest("setSession", args);
    },
    deleteSession: function(sessionId) {
      args = [sessionId];
      return this.getRequest("deleteSession", args);
    },
    addQueryIntoSession: function(query, sessionId) {
      args = [query, sessionId];
      return this.getRequest("addQueryIntoSession", args);
    },
    removeQueryFromSession: function(queryId, sessionId) {
      args = [queryId, sessionId];
      return this.getRequest("removeQueryFromSession", args);
    },
    getUserFromVo: function(voId) {
      args = [voId];
      return this.getRequest("getUserFromVo", args);
    },
    setUserOfVo: function(userId, voId) {
      args = [dataId, dataType];
      return this.getRequest("setUserOfVo", args);
    },
    getVosByUserId: function(userId) {
      args = [userId];
      return this.getRequest("getVosByUserId", args);
    },
    addMetaIntoVo: function(meta, voId) {
      args = [meta, voId];
      return this.getRequest("addMetaIntoVo", args);
    },
    removeMetaFromVo: function(metaId, voId) {
      args = [metaId, voId];
      return this.getRequest("removeMetaFromVo", args);
    }
  });

  // Users
  var Users = Chatanoo.Service.Users = function (url) {
    this.initialize(url);
  }

  _.extend(Users.prototype, AbstractService, Events, {
    getUsers: function(options) {
      options = options || [];
      return this.getRequest("getUsers", options);
    },
    getUserById: function(userId) {
      args = [userId];
      return this.getRequest("getUserById", args);
    },
    addUser: function(user) {
      args = [user];
      return this.getRequest("addUser", args);
    },
    setUser: function(user) {
      args = [user];
      return this.getRequest("setUser", args);
    },
    deleteUser: function(userId) {
      args = [userId];
      return this.getRequest("deleteUser", args);
    },
    banUser: function(userId, trueOrFalse) {
      args = [userId, trueOrFalse];
      return this.getRequest("banUser", args);
    },
    addDataIntoVo: function(data, voId) {
      args = [data, voId];
      return this.getRequest("addDataIntoVo", args);
    },
    removeDataFromVo: function(dataId, dataType, voId) {
      args = [dataId, dataType, voId];
      return this.getRequest("removeDataFromVo", args);
    }
  });

  // ------------
  // VALUE OBJECT
  // ------------

  Chatanoo.ValueObject = {};

  var AbstractValueObject = Chatanoo.ValueObject.Abstract = {
    initialize: function(json) {
      for(prop in json)
      {
        switch(prop) {
          case "addDate":
          case "setDate":
            this[prop] = moment(json[prop], "YYYY.MM.DD HH:mm:ss"); break;
          default:
            this[prop] = json[prop]; break;
        }
      }
    }
  };

  // Item
  var Item = Chatanoo.ValueObject.Item = function(json) {
    this.__className = "Vo_Item";
    this.initialize(json);
  }

  _.extend(Item.prototype, AbstractValueObject, {

  });

  // Meta
  var Meta = Chatanoo.ValueObject.Meta = function(json) {
    this.__className = "Vo_Meta";
    this.initialize(json);
  }

  _.extend(Meta.prototype, AbstractValueObject, {

  });

  // Query
  var Query = Chatanoo.ValueObject.Query = function(json) {
    this.__className = "Vo_Query";
    this.initialize(json);
  }

  _.extend(Query.prototype, AbstractValueObject, {

  });

  // Session
  var Session = Chatanoo.ValueObject.Session = function(json) {
    this.__className = "Vo_Session";
    this.initialize(json);
  }

  _.extend(Session.prototype, AbstractValueObject, {

  });

  // User
  var User = Chatanoo.ValueObject.User = function(json) {
    this.__className = "Vo_User";
    this.initialize(json);
  }

  _.extend(User.prototype, AbstractValueObject, {

  });

  // Comment
  var Comment = Chatanoo.ValueObject.Comment = function(json) {
    this.__className = "Vo_Comment";
    this.initialize(json);
  }

  _.extend(Comment.prototype, AbstractValueObject, {

  });

  // -----
  // DATAS
  // -----
  Chatanoo.ValueObject.Data = {};

  var AbstractDataValueObject = Chatanoo.ValueObject.Data.Abstract = {

  };

  _.extend(AbstractDataValueObject, AbstractValueObject);

  // Address
  var Address = Chatanoo.ValueObject.Data.Address = function(json) {
    this.__className = "Vo_Data_Adress";
    this.initialize(json);
  }

  _.extend(Address.prototype, AbstractDataValueObject, {

  });

  // Carto
  var Carto = Chatanoo.ValueObject.Data.Carto = function(json) {
    this.__className = "Vo_Data_Carto";
    this.initialize(json);
  }

  _.extend(Carto.prototype, AbstractDataValueObject, {

  })

  // Vote
  var Vote = Chatanoo.ValueObject.Data.Vote = function(json) {
    this.__className = "Vo_Data_Vote";
    this.initialize(json);
  }

  _.extend(Vote.prototype, AbstractDataValueObject, {

  })


  // ------
  // MEDIAS
  // ------
  Chatanoo.ValueObject.Media = {};

  var AbstractMediaValueObject = Chatanoo.ValueObject.Media.Abstract = {

  };

  _.extend(AbstractMediaValueObject, AbstractValueObject);

  // Picture
  var Picture = Chatanoo.ValueObject.Media.Picture = function(json) {
    this.__className = "Vo_Media_Picture";
    this.initialize(json);
  }

  _.extend(Picture.prototype, AbstractMediaValueObject, {

  });

  // Sound
  var Sound = Chatanoo.ValueObject.Media.Sound = function(json) {
    this.__className = "Vo_Media_Sound";
    this.initialize(json);
  }

  _.extend(Sound.prototype, AbstractMediaValueObject, {

  });

  // Text
  var Text = Chatanoo.ValueObject.Media.Text = function(json) {
    this.__className = "Vo_Media_Text";
    this.initialize(json);
  }

  _.extend(Text.prototype, AbstractMediaValueObject, {

  });

  // Video
  var Video = Chatanoo.ValueObject.Media.Video = function(json) {
    this.__className = "Vo_Media_Video";
    this.initialize(json);
  }

  _.extend(Video.prototype, AbstractMediaValueObject, {

  });

  //
  _.extend(Chatanoo, Events);

}).call(this);
