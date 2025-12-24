"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservationController_1 = require("../controllers/reservationController");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const { asyncHandler } = require('../middleware/errorHandler');
const validators_1 = require("../middleware/validators");
const router = (0, express_1.Router)();
// Customer: create reservation
router.post('/reservations', auth_1.authenticate, (0, validators_1.validate)(validators_1.createReservationValidator), asyncHandler(reservationController_1.createReservation));
// Customer: list own reservations
router.get('/reservations', auth_1.authenticate, asyncHandler(reservationController_1.getMyReservations));
// Manager/Admin: get all reservations
router.get('/reservations/all', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.MANAGER, types_1.UserRole.ADMIN), asyncHandler(reservationController_1.getAllReservations));
// Update reservation (owner or manager)
router.put('/reservations/:id', auth_1.authenticate, asyncHandler(reservationController_1.updateReservation));
// Cancel reservation
router.put('/reservations/:id/cancel', auth_1.authenticate, asyncHandler(reservationController_1.cancelReservation));
exports.default = router;
//# sourceMappingURL=reservationRoutes.js.map