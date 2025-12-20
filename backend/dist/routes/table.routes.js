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
const express_1 = require("express");
const tableController = __importStar(require("../controllers/table.controller"));
const authController = __importStar(require("../controllers/auth.controller"));
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
// Protect all routes after this middleware
router.use(authController.protect);
// Routes for table management
router
    .route('/')
    .get(tableController.getAllTables)
    .post(authController.restrictTo('manager', 'admin'), (0, express_validator_1.body)('table_number').isInt().withMessage('table_number is required and must be an integer'), (0, express_validator_1.body)('capacity').isInt({ min: 1 }).withMessage('capacity is required and must be >= 1'), validate_middleware_1.runValidation, tableController.createTable);
// Get available tables within a time range
router.get('/available', tableController.getAvailableTables);
router
    .route('/:id')
    .get(tableController.getTable)
    .patch(authController.restrictTo('manager', 'admin'), tableController.updateTable)
    .delete(authController.restrictTo('manager', 'admin'), tableController.deleteTable);
exports.default = router;
//# sourceMappingURL=table.routes.js.map