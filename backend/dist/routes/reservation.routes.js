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
const reservationController = __importStar(require("../controllers/reservation.controller"));
const authController = __importStar(require("../controllers/auth.controller"));
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
// Protect all routes after this middleware
router.use(authController.protect);
// Routes for reservation management
router
    .route('/')
    .get(reservationController.getAllReservations)
    .post(authController.restrictTo('customer', 'manager', 'admin'), (0, express_validator_1.body)('user_id').isInt().withMessage('user_id is required'), (0, express_validator_1.body)('table_id').isInt().withMessage('table_id is required'), (0, express_validator_1.body)('reservation_time').isISO8601().withMessage('reservation_time must be a valid ISO8601 datetime'), (0, express_validator_1.body)('party_size').isInt({ min: 1 }).withMessage('party_size must be >= 1'), validate_middleware_1.runValidation, reservationController.createReservation);
router
    .route('/:id')
    .get(reservationController.getReservation)
    .patch(authController.restrictTo('customer', 'manager', 'admin'), reservationController.updateReservation)
    .delete(authController.restrictTo('customer', 'manager', 'admin'), reservationController.cancelReservation);
// Get reservations by user
router.get('/user/:userId', (0, express_validator_1.param)('userId').isInt().withMessage('userId must be an integer'), validate_middleware_1.runValidation, reservationController.getUserReservations);
// Update reservation status (for managers/admins)
router.patch('/:id/status', authController.restrictTo('manager', 'admin'), reservationController.updateReservationStatus);
exports.default = router;
//# sourceMappingURL=reservation.routes.js.map