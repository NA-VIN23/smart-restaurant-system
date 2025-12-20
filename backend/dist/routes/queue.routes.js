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
const queueController = __importStar(require("../controllers/queue.controller"));
const authController = __importStar(require("../controllers/auth.controller"));
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
// Protect all routes after this middleware
router.use(authController.protect);
// Queue management routes
router
    .route('/')
    .get(authController.restrictTo('manager', 'admin'), queueController.getQueue)
    .post((0, express_validator_1.body)('user_id').isInt().withMessage('user_id must be an integer'), (0, express_validator_1.body)('party_size').isInt({ min: 1 }).withMessage('party_size must be >= 1'), validate_middleware_1.runValidation, queueController.joinQueue);
router
    .route('/:id')
    .patch(authController.restrictTo('manager', 'admin'), queueController.updateQueueStatus)
    .delete(queueController.leaveQueue);
// Get queue position for a user
router.get('/position/:userId', (0, express_validator_1.param)('userId').isInt().withMessage('userId must be an integer'), validate_middleware_1.runValidation, queueController.getQueuePosition);
exports.default = router;
//# sourceMappingURL=queue.routes.js.map