"use strict";
exports.__esModule = true;
var IdGenerator = /** @class */ (function () {
    function IdGenerator() {
    }
    IdGenerator.generateId = function (length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
    return IdGenerator;
}());
exports.IdGenerator = IdGenerator;
