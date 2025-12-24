"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.comparePassword = exports.hashPassword = exports.validatePassword = exports.validateEmail = exports.isFutureDate = exports.calculateEstimatedWaitTime = exports.errorResponse = exports.successResponse = void 0;
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
// Compatibility shim: if the imported module is returned directly (CommonJS),
// ensure we access the functions correctly (some environments put functions on the module itself)
var bcrypt = (bcrypt_1 && bcrypt_1.default) ? bcrypt_1.default : bcrypt_1;
var jwt = (jsonwebtoken_1 && jsonwebtoken_1.default) ? jsonwebtoken_1.default : jsonwebtoken_1;
var successResponse = function (message, data) { return ({ success: true, message: message, data: data }); };
exports.successResponse = successResponse;
var errorResponse = function (message, details) { return ({ success: false, message: message, details: details }); };
exports.errorResponse = errorResponse;
var calculateEstimatedWaitTime = function (position) {
    // Simple heuristic: 5 minutes per position
    var minutes = Math.max(0, Math.floor(position) * 5);
    return minutes;
};
exports.calculateEstimatedWaitTime = calculateEstimatedWaitTime;
var isFutureDate = function (date) {
    return date.getTime() > Date.now();
};
exports.isFutureDate = isFutureDate;
var validateEmail = function (email) {
    var re = /^\S+@\S+\.\S+$/;
    return re.test(email);
};
exports.validateEmail = validateEmail;
var validatePassword = function (password) {
    if (!password || password.length < 6)
        return { valid: false, message: 'Password must be at least 6 characters' };
    return { valid: true };
};
exports.validatePassword = validatePassword;
var hashPassword = function (password) { return __awaiter(void 0, void 0, void 0, function () {
    var saltRounds;
    return __generator(this, function (_a) {
        saltRounds = 10;
        return [2 /*return*/, bcrypt.hash(password, saltRounds)];
    });
}); };
exports.hashPassword = hashPassword;
var comparePassword = function (password, hash) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, bcrypt.compare(password, hash)];
    });
}); };
exports.comparePassword = comparePassword;
var generateToken = function (payload, expiresIn) {
    if (expiresIn === void 0) { expiresIn = '7d'; }
    var secret = (process.env.JWT_SECRET || 'dev_secret');
    // use any cast to avoid tight jwt typings in this utility
    return jwt.sign(payload, secret, { expiresIn: expiresIn });
};
exports.generateToken = generateToken;
exports.default = {};
