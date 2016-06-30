var express = require('express');
var bodyParser = require("body-parser");
var sockio = require("socket.io");
var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
var io = sockio.listen(app.listen(4200), {log:true});
