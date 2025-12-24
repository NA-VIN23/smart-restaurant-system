"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidator = exports.registerValidator = exports.createReservationValidator = exports.joinQueueValidator = exports.updateTableValidator = exports.createTableValidator = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (validations) => async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    return next();
};
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
//# sourceMappingURL=validators.js.map