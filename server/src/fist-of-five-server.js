"use strict";
exports.__esModule = true;
var fist_of_five_session_1 = require("./fist-of-five-session");
var messages_1 = require("../../common/src/messages");
var id_generator_1 = require("./id-generator");
var SocketIO = require("socket.io");
var FistOfFiveServer = /** @class */ (function () {
    function FistOfFiveServer(server) {
        var _this = this;
        this.sessionsForSessionIds = new Map();
        this.sessionsForClientIds = new Map();
        this.io = SocketIO(server);
        this.io.on('connect', function (socket) {
            var clientId = id_generator_1.IdGenerator.generateId(32);
            socket.on('message', function (requestMessage) {
                console.log("Incoming message: ", requestMessage);
                if (requestMessage.requestType === messages_1.RequestType.Register) {
                    var sessionId = _this.register(clientId, socket, requestMessage);
                    var registeredResponse = {
                        responseType: messages_1.ResponseType.Registered,
                        sessionId: sessionId
                    };
                    socket.send(registeredResponse);
                }
                else if (requestMessage.requestType === messages_1.RequestType.Vote) {
                    var voteMessage = requestMessage;
                    var session = _this.sessionsForClientIds.get(clientId);
                    if (session) {
                        session.vote(clientId, voteMessage.fingers);
                    }
                }
                else if (requestMessage.requestType === messages_1.RequestType.GameRestart) {
                    var restartMessage = requestMessage;
                    var session = _this.sessionsForClientIds.get(clientId);
                    if (session) {
                        session.restartGame(clientId);
                    }
                }
            });
            socket.on('disconnect', function () {
                _this.unregister(clientId);
            });
            var connectedMessage = {
                responseType: messages_1.ResponseType.Connected
            };
            socket.send(connectedMessage);
        });
        setInterval(function () {
            //TODO: clear sessionsForSessionIDs and sessionsForClientIDs
            _this.sessionsForSessionIds.forEach(function (value, key, map) {
                if (value.clients.size === 0) {
                    map["delete"](key);
                    console.log("Session " + key + " garbage collected");
                }
            });
            _this.sessionsForClientIds.forEach(function (value, key, map) {
                if (value.clients.size === 0) {
                    map["delete"](key);
                    console.log("Client " + key + " garbage collected");
                }
            });
        }, 60000);
    }
    FistOfFiveServer.prototype.unregister = function (clientId) {
        if (this.sessionsForClientIds.has(clientId)) {
            var session = this.sessionsForClientIds.get(clientId);
            session.unregisterClient(clientId);
            if (session.clients.size == 0) {
                this.sessionsForSessionIds["delete"](session.sessionId);
            }
            this.sessionsForClientIds["delete"](clientId);
        }
    };
    FistOfFiveServer.prototype.register = function (clientId, websocket, registerMessage) {
        if (this.sessionsForSessionIds.has(clientId)) {
            console.error('Register Message received, when client was already registered');
            this.unregister(clientId);
        }
        if (!registerMessage.sessionId) {
            registerMessage.sessionId = id_generator_1.IdGenerator.generateId(32);
        }
        if (this.sessionsForSessionIds.has(registerMessage.sessionId)) {
            var session = this.sessionsForSessionIds.get(registerMessage.sessionId);
            session.registerClient(clientId, registerMessage.userName, websocket);
            this.sessionsForClientIds.set(clientId, session);
        }
        else {
            var session = new fist_of_five_session_1.FistOfFiveSession(registerMessage.sessionId);
            session.registerClient(clientId, registerMessage.userName, websocket);
            this.sessionsForSessionIds.set(session.sessionId, session);
            this.sessionsForClientIds.set(clientId, session);
        }
        return registerMessage.sessionId;
    };
    return FistOfFiveServer;
}());
exports.FistOfFiveServer = FistOfFiveServer;
