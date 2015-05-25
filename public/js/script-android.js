/* Author:

*/
require.config({
  baseUrl: './js',
  shim: {
    'underscore': { exports: '_' },
    'jquery': { exports: '$' },
    'cookie': { exports: '$', deps: ['jquery'] },
    // 'jquery-ui': { exports: '$', deps: ['jquery'] },
    'gritter': { deps: ['jquery'] },
    'modernizr': { exports: 'Modernizr' },
    'backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone' },
    'chatanoo': { deps: ['underscore', 'jquery'], exports: 'Chatanoo' },
    'elastic': { deps: ['jquery'] }
  },
  paths: {
    'text': '../components/requirejs-text/text',
    'json': '../components/requirejs-plugins/src/json',
    'dom-ready': '../components/requirejs-domready/domReady',

    'underscore': '../components/underscore/underscore',
    'jquery': '../components/jquery/jquery',
    'cookie': '../components/jquery.cookie/jquery.cookie',
    'moment': '../components/moment/moment',
    'elastic': 'libs/jquery.elastic-1.6.11',
    'modernizr': '../components/modernizr/modernizr',
    'backbone': '../components/backbone/backbone',
    'chatanoo': 'libs/chatanoo-0.1.0',
    'gritter': '../components/jquery.gritter/js/jquery.gritter',

    'config': 'app/config-android'
  },
  waitSeconds: 45
});

require([
  'app/app',

  'cookie',
  'gritter',
  'elastic',
  'app/helpers/mixin'
], function(App) {
  console.log("App ios loaded");
    App.initialize();
});




