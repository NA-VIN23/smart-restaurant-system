"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const table_routes_1 = __importDefault(require("./table.routes"));
const reservation_routes_1 = __importDefault(require("./reservation.routes"));
const queue_routes_1 = __importDefault(require("./queue.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/tables', table_routes_1.default);
router.use('/reservations', reservation_routes_1.default);
router.use('/queue', queue_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map