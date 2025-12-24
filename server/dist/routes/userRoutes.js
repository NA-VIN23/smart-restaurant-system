"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const { asyncHandler } = require('../middleware/errorHandler');
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
// Admin-only user management
router.get('/users', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.ADMIN), asyncHandler(userController_1.getAllUsers));
router.get('/users/:id', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.ADMIN), asyncHandler(userController_1.getUserById));
router.put('/users/:id', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.ADMIN), asyncHandler(userController_1.updateUser));
router.delete('/users/:id', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.ADMIN), asyncHandler(userController_1.deleteUser));
exports.default = router;
//# sourceMappingURL=userRoutes.js.map