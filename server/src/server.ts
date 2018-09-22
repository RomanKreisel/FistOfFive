import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as fs from 'fs';
import {FistOfFiveServer} from './fist-of-five-server';
import SocketIO = require('socket.io');

const app = express();

//initialize a simple http server
const server = http.createServer(app);

app.get('/', function(req, res) {
    console.log('Get index');
    fs.createReadStream('./index.html')
    .pipe(res);
});

let fistOfFiveServer = new FistOfFiveServer(server);


//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log('Server started');
});