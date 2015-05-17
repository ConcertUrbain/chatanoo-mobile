require('dotenv').load();

var express = require('express');
var fs = require('fs');
var _ = require('underscore');

var server = express();

server.get('/js/app/config.js', function(req, res){
  fs.readFile('public/js/app/config.js', 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    _(process.env).each( function(val, key) {
      data = data.replace( new RegExp("\\$\\{" + key + "\\}", "g"), val );
    });
    res.send(data);
  });
});
server.use( express.static('public') )

server.listen( process.env.PORT || 4000 );
