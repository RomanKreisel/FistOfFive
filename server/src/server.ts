import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as fs from 'fs';
import {FistOfFiveServer} from './fist-of-five-server';
import SocketIO = require('socket.io');

const app = express();


//initialize a simple http server
const server = http.createServer(app);

app.use(express.static('dist/client'));

let fistOfFiveServer = new FistOfFiveServer(server);


//start our server
let port = process.env.PORT || 80;
server.listen(port, () => {
    console.log('Server started on port ' + port);
});