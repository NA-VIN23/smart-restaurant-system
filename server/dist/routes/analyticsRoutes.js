"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// Manager/Admin routes
router.get('/tables', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.MANAGER, types_1.UserRole.ADMIN), (0, errorHandler_1.asyncHandler)(analyticsController_1.getTableAnalytics));
router.get('/users', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.ADMIN), (0, errorHandler_1.asyncHandler)(analyticsController_1.getUserStats));
router.get('/queue', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.MANAGER, types_1.UserRole.ADMIN), (0, errorHandler_1.asyncHandler)(analyticsController_1.getQueueAnalytics));
router.get('/dashboard', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.MANAGER, types_1.UserRole.ADMIN), (0, errorHandler_1.asyncHandler)(analyticsController_1.getDashboardStats));
exports.default = router;
//# sourceMappingURL=analyticsRoutes.js.map