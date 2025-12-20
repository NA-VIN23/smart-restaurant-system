"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
require("dotenv/config");
const port = process.env.PORT || 3000;
const server = http_1.default.createServer(app_1.default);
server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server running on port ${port}`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    // eslint-disable-next-line no-console
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        // eslint-disable-next-line no-console
        console.log('Process terminated');
    });
});
//# sourceMappingURL=server.js.map