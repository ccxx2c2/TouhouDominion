"use strict";
var express = require('express');
var app = express();

var http = require('http').Server(app);

var fs = require('fs');
var privateKey  = fs.readFileSync('/root/private.pem', 'utf8');
var certificate = fs.readFileSync('/root/file.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var https = require('https').createServer(credentials, app);

var io = require('socket.io')(https);
var sf = require(__dirname+'/socketFunc.js');
var g = require(__dirname+'/global.js');
var pages = g.pages;

http.listen(80, () => {
  console.log(new Date().toLocaleString() + ' listening on *:80');
});
https.listen(443, () => {
  console.log(new Date().toLocaleString() + ' listening on *:443');
});

app.get('/', function(req, res) {
  console.log(req.hostname, req.protocol);
  if(req.protocol === "http"){
    res.writeHead(301,{
        'Location': `https://${req.hostname}/`
    });
    res.end();
  }
  else {
    res.send(pages[0]);
  }
});
app.use(express.static(__dirname + '/public'));

io.on('connection',sf);
