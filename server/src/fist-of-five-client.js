"use strict";
exports.__esModule = true;
var FistOfFiveClient = /** @class */ (function () {
    function FistOfFiveClient(clientId, username, socket) {
        this.vote = -1;
        this._clientId = clientId;
        this._username = username;
        this._socket = socket;
    }
    FistOfFiveClient.prototype.clientId = function () {
        get: {
            return this._clientId;
        }
    };
    FistOfFiveClient.prototype.username = function () {
        get: {
            return this._username;
        }
    };
    FistOfFiveClient.prototype.socket = function () {
        get: {
            return this._socket;
        }
    };
    return FistOfFiveClient;
}());
exports.FistOfFiveClient = FistOfFiveClient;
