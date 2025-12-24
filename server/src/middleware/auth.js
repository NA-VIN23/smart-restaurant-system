"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var authenticate = function (req, res, next) {
    var authHeader = req.headers['authorization'] || req.headers['Authorization'];
    var token = typeof authHeader === 'string' && authHeader.split(' ')[1];
    if (!token) {
        // allow unauthenticated access for public routes
        req.user = null;
        return next();
    }
    try {
        var secret = process.env.JWT_SECRET || 'dev_secret';
        var payload = jsonwebtoken_1.default.verify(token, secret);
        req.user = payload;
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
var authorize = function () {
    var roles = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        roles[_i] = arguments[_i];
    }
    return function (req, res, next) {
        var user = req.user;
        if (!user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        if (roles.length === 0)
            return next();
        if (!roles.includes(user.role))
            return res.status(403).json({ success: false, message: 'Forbidden' });
        next();
    };
};
exports.authorize = authorize;
