"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const validators_1 = require("../middleware/validators");
const router = (0, express_1.Router)();
router.post('/register', (0, validators_1.validate)(validators_1.registerValidator), (0, errorHandler_1.asyncHandler)(authController_1.register));
router.post('/login', (0, validators_1.validate)(validators_1.loginValidator), (0, errorHandler_1.asyncHandler)(authController_1.login));
router.get('/profile', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(authController_1.getProfile));
exports.default = router;
//# sourceMappingURL=authRoutes.js.map