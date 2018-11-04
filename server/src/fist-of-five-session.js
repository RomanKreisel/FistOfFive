"use strict";
exports.__esModule = true;
var fist_of_five_client_1 = require("./fist-of-five-client");
var messages_1 = require("../../common/src/messages");
var FistOfFiveSession = /** @class */ (function () {
    function FistOfFiveSession(sessionId) {
        this._clients = new Map();
        this.clientIdsInOrder = [];
        this.clientVotes = [];
        this._sessionId = sessionId;
    }
    FistOfFiveSession.prototype.findUsername = function (proposal, iterator) {
        if (iterator === void 0) { iterator = 0; }
        var username = proposal;
        if (!username) {
            username = "Dummy";
        }
        if (iterator > 0) {
            username = proposal + " (" + iterator + ")";
        }
        var nameAlreadyPresent = false;
        this._clients.forEach(function (client) {
            if (client.username() === username) {
                nameAlreadyPresent = true;
            }
        });
        if (nameAlreadyPresent) {
            return this.findUsername(proposal, Math.max(2, iterator + 1));
        }
        return username;
    };
    FistOfFiveSession.prototype.registerClient = function (clientId, username, socket) {
        username = this.findUsername(username);
        this.clientIdsInOrder.push(clientId);
        this.clients.set(clientId, new fist_of_five_client_1.FistOfFiveClient(clientId, username, socket));
        this.sendGameStatusResponse();
        console.log('Client ' + clientId + ' joined session ' + this.sessionId + ' (' + this.clients.size + ' client(s) connected in this session)');
    };
    FistOfFiveSession.prototype.unregisterClient = function (clientId) {
        if (this.clientIdsInOrder.indexOf(clientId) === -1) {
            return;
        }
        this.clientVotes = this.clientVotes.filter(function (value) {
            value !== clientId;
        });
        this.clientIdsInOrder = this.clientIdsInOrder.filter(function (value) {
            value !== clientId;
        });
        this.clients["delete"](clientId);
        this.sendGameStatusResponse();
        console.log('Client ' + clientId + ' left session ' + this.sessionId + ' (' + this.clients.size + ' client(s) connected in this session)');
    };
    FistOfFiveSession.prototype.vote = function (clientId, vote) {
        if (vote < 0 || vote > 5) {
            console.log('Client ' + clientId + ' voted ' + vote + ', which isn\'t allowed');
            return;
        }
        var client = this.clients.get(clientId);
        if (client.vote > 0) {
            var allClientsVoted_1 = true;
            this.clients.forEach(function (client) {
                if (client.vote < 0) {
                    allClientsVoted_1 = false;
                }
            });
            if (allClientsVoted_1) {
                console.log('Voting not allowed, after all clients already voted');
                return;
            }
        }
        client.vote = vote;
        if (this.clientVotes.indexOf(clientId) === -1) {
            this.clientVotes.push(clientId);
        }
        this.sendGameStatusResponse();
        console.log('Client ' + clientId + ' voted');
        if (this.clientVotes.length >= this.clientIdsInOrder.length) {
            console.log('Game complete with ' + this.clientVotes.length + ' votes');
        }
    };
    FistOfFiveSession.prototype.restartGame = function (clientId) {
        if (this.areYouAdmin(clientId)) {
            this.clientVotes = this.clientVotes.slice(0);
            this.sendGameStatusResponse();
        }
        else {
            console.log('Client ' + clientId + 'tried to reset the game, but isn\'t admin');
        }
    };
    Object.defineProperty(FistOfFiveSession.prototype, "sessionId", {
        get: function () {
            return this._sessionId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FistOfFiveSession.prototype, "clients", {
        get: function () {
            return this._clients;
        },
        enumerable: true,
        configurable: true
    });
    FistOfFiveSession.prototype.sendGameStatusResponse = function () {
        var _this = this;
        setTimeout(function () {
            for (var _i = 0, _a = _this.clients.keys(); _i < _a.length; _i++) {
                var clientId = _a[_i];
                var client = _this.clients.get(clientId);
                if (client instanceof fist_of_five_client_1.FistOfFiveClient) {
                    client.socket().send(_this.getGameStatusResponseMessage(clientId));
                }
            }
        }, 1);
    };
    FistOfFiveSession.prototype.getGameStatusResponseMessage = function (myClientId) {
        var clients = [];
        for (var _i = 0, _a = this.clients.keys(); _i < _a.length; _i++) {
            var clientId = _a[_i];
            var client = this.clients.get(clientId);
            var clientMessage = this.getClientMessage(clientId, client, myClientId, this.clientVotes.length >= this.clientIdsInOrder.length);
            clients.push(clientMessage);
        }
        var message = {
            responseType: messages_1.ResponseType.GameStatus,
            clients: clients
        };
        return message;
    };
    FistOfFiveSession.prototype.areYouAdmin = function (myClientId) {
        return this.clientIdsInOrder[0] === myClientId;
        ;
    };
    FistOfFiveSession.prototype.getClientMessage = function (clientId, client, myClientId, showVotes) {
        var message = {
            username: client.username(),
            hasVoted: client.vote > -1,
            thisIsYou: clientId === myClientId,
            isAdmin: this.areYouAdmin(clientId),
            vote: showVotes ? client.vote : -1
        };
        return message;
    };
    return FistOfFiveSession;
}());
exports.FistOfFiveSession = FistOfFiveSession;
