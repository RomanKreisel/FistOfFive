"use strict";
exports.__esModule = true;
var express = require("express");
var http = require("http");
var fs = require("fs");
var fist_of_five_server_1 = require("./fist-of-five-server");
var app = express();
//initialize a simple http server
var server = http.createServer(app);
app.get('/', function (req, res) {
    console.log('Get index');
    fs.createReadStream('./index.html')
        .pipe(res);
});
var fistOfFiveServer = new fist_of_five_server_1.FistOfFiveServer(server);
//start our server
server.listen(process.env.PORT || 8999, function () {
    console.log('Server started');
});
