import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as fs from 'fs';
import {FistOfFiveServer} from './fist-of-five-server';

const app = express();

//initialize a simple http server
const server = http.createServer(app);

app.get('/', function(req, res) {
    console.log('Get index');
    fs.createReadStream('./index.html')
    .pipe(res);
});

let fistOfFiveServer = new FistOfFiveServer(new WebSocket.Server({server}));
fistOfFiveServer.start()
  
/*
server.on('request', function(request) {
    console.log('abc');
});

server.on('connection', function(socket) {
    console.log('xyz' + socket.localAddress + ":" + socket.localPort);
});
*/


//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log('Server started');
});