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
const auth_1 = require("../middleware/auth");
const tableController = __importStar(require("../controllers/tableController"));
const types_1 = require("../types");
const validators_1 = require("../middleware/validators");
const router = (0, express_1.Router)();
// Public
router.get('/tables', tableController.getAllTables);
router.get('/tables/available', tableController.getAvailableTables);
router.get('/tables/:id', tableController.getTableById);
// Manager/Admin (protected)
router.post('/tables', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.MANAGER, types_1.UserRole.ADMIN), (0, validators_1.validate)(validators_1.createTableValidator), tableController.createTable);
router.put('/tables/:id', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.MANAGER, types_1.UserRole.ADMIN), (0, validators_1.validate)(validators_1.updateTableValidator), tableController.updateTable);
router.delete('/tables/:id', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.MANAGER, types_1.UserRole.ADMIN), tableController.deleteTable);
router.post('/tables/:id/vacate', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.MANAGER, types_1.UserRole.ADMIN), tableController.vacateTable);
exports.default = router;
//# sourceMappingURL=tableRoutes.js.map