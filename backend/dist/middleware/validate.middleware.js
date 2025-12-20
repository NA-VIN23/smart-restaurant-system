"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runValidation = void 0;
const express_validator_1 = require("express-validator");
const error_middleware_1 = require("./error.middleware");
const runValidation = (req, _res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const msg = errors.array().map(e => `${e.param}: ${e.msg}`).join('; ');
        return next(new error_middleware_1.AppError(msg, 400));
    }
    next();
};
exports.runValidation = runValidation;
//# sourceMappingURL=validate.middleware.js.map