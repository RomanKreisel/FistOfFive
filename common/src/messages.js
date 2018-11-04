"use strict";
/*
 * Requests (client -> server)
 */
exports.__esModule = true;
var RequestType;
(function (RequestType) {
    RequestType[RequestType["Register"] = 0] = "Register";
    RequestType[RequestType["Vote"] = 1] = "Vote";
    RequestType[RequestType["GameRestart"] = 2] = "GameRestart";
})(RequestType = exports.RequestType || (exports.RequestType = {}));
/*
 * Responses (server -> client)
 */
var ResponseType;
(function (ResponseType) {
    ResponseType[ResponseType["Connected"] = 0] = "Connected";
    ResponseType[ResponseType["Registered"] = 1] = "Registered";
    ResponseType[ResponseType["GameStatus"] = 2] = "GameStatus";
})(ResponseType = exports.ResponseType || (exports.ResponseType = {}));
