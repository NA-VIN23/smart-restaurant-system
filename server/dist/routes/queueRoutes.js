"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const queueController_1 = require("../controllers/queueController");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const errorHandler_1 = require("../middleware/errorHandler");
const validators_1 = require("../middleware/validators");
const router = (0, express_1.Router)();
// Customer: join queue
router.post('/queue', auth_1.authenticate, (0, validators_1.validate)(validators_1.joinQueueValidator), (0, errorHandler_1.asyncHandler)(queueController_1.joinQueue));
// Customer: get own queue status
router.get('/queue/position', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(queueController_1.getQueueStatus));
// Manager/Admin: get any user's position
router.get('/queue/position/:userId', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.MANAGER, types_1.UserRole.ADMIN), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // Reuse controller logic by temporarily setting req.user
    req.user = { id: parseInt(req.params.userId, 10) };
    return (0, queueController_1.getQueueStatus)(req, res);
}));
// Manager/Admin: view all queue entries
router.get('/queue', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.MANAGER, types_1.UserRole.ADMIN), (0, errorHandler_1.asyncHandler)(queueController_1.getAllQueueEntries));
// Customer: leave queue
router.post('/queue/leave', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(queueController_1.leaveQueue));
// Manager: seat customer
router.post('/queue/seat', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.MANAGER, types_1.UserRole.ADMIN), (0, errorHandler_1.asyncHandler)(queueController_1.seatCustomer));
exports.default = router;
//# sourceMappingURL=queueRoutes.js.map