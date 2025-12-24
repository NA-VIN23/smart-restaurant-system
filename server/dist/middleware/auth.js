"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = typeof authHeader === 'string' && authHeader.split(' ')[1];
    if (!token) {
        // allow unauthenticated access for public routes
        req.user = null;
        return next();
    }
    try {
        const secret = process.env.JWT_SECRET || 'dev_secret';
        const payload = jwt.verify(token, secret);
        req.user = payload;
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
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
//# sourceMappingURL=auth.js.map