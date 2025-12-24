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
exports.loginValidator = exports.registerValidator = exports.createReservationValidator = exports.joinQueueValidator = exports.updateTableValidator = exports.createTableValidator = exports.validate = void 0;
var express_validator_1 = require("express-validator");
var validate = function (validations) { return function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var errors;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.all(validations.map(function (validation) { return validation.run(req); }))];
            case 1:
                _a.sent();
                errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() })];
                }
                return [2 /*return*/, next()];
        }
    });
}); }; };
exports.validate = validate;
exports.createTableValidator = [
    (0, express_validator_1.body)('table_number').isString().notEmpty().withMessage('Table number is required'),
    (0, express_validator_1.body)('capacity').isInt({ gt: 0 }).withMessage('Capacity must be greater than 0'),
    (0, express_validator_1.body)('type').optional().isIn(['Regular', 'VIP']).withMessage('Type must be Regular or VIP')
];
exports.updateTableValidator = [
    (0, express_validator_1.body)('capacity').optional().isInt({ gt: 0 }).withMessage('Capacity must be greater than 0'),
    (0, express_validator_1.body)('type').optional().isIn(['Regular', 'VIP']).withMessage('Type must be Regular or VIP'),
    (0, express_validator_1.body)('status').optional().isIn(['Available', 'Occupied', 'Reserved']).withMessage('Invalid status')
];
exports.joinQueueValidator = [
    (0, express_validator_1.body)('capacity_needed').isInt({ gt: 0 }).withMessage('Valid capacity is required'),
    (0, express_validator_1.body)('type_preference').optional().isIn(['Regular', 'VIP'])
];
exports.createReservationValidator = [
    (0, express_validator_1.body)('table_id').isInt().withMessage('Table ID is required'),
    (0, express_validator_1.body)('reservation_time').isISO8601().withMessage('Valid reservation time is required'),
    (0, express_validator_1.body)('notes').optional().isString()
];
exports.registerValidator = [
    (0, express_validator_1.body)('name').isString().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('role').isIn(['Customer', 'Manager', 'Admin']).withMessage('Role must be Customer, Manager, or Admin')
];
exports.loginValidator = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isString().notEmpty().withMessage('Password is required')
];
exports.default = {};
