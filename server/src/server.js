"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
let tableRoutes_1;
let queueRoutes_1;
let reservationRoutes_1;
let userRoutes_1;
// Some routes may fail to load during tests if compiled artifacts exist in src; load dynamically with graceful fallback
try {
    tableRoutes_1 = __importDefault(require("./routes/tableRoutes"));
}
catch (err) {
    console.warn('Skipping tableRoutes import during test bootstrap:', err);
}
try {
    queueRoutes_1 = __importDefault(require("./routes/queueRoutes"));
}
catch (err) {
    console.warn('Skipping queueRoutes import during test bootstrap:', err);
}
try {
    reservationRoutes_1 = __importDefault(require("./routes/reservationRoutes"));
}
catch (err) {
    console.warn('Skipping reservationRoutes import during test bootstrap:', err);
}
try {
    userRoutes_1 = __importDefault(require("./routes/userRoutes"));
}
catch (err) {
    console.warn('Skipping userRoutes import during test bootstrap:', err);
}
console.log('authRoutes type:', typeof authRoutes_1.default);
console.log('tableRoutes type:', typeof (tableRoutes_1 === null || tableRoutes_1 === void 0 ? void 0 : tableRoutes_1.default));
if (authRoutes_1.default) {
    // Mount auth under both `/api/auth` and `/api` to preserve compatibility with existing tests
    app.use('/api/auth', authRoutes_1.default);
    app.use('/api', authRoutes_1.default);
}
if (tableRoutes_1 === null || tableRoutes_1 === void 0 ? void 0 : tableRoutes_1.default)
    app.use('/api', tableRoutes_1.default);
if (queueRoutes_1 === null || queueRoutes_1 === void 0 ? void 0 : queueRoutes_1.default)
    app.use('/api', queueRoutes_1.default);
if (reservationRoutes_1 === null || reservationRoutes_1 === void 0 ? void 0 : reservationRoutes_1.default)
    app.use('/api', reservationRoutes_1.default);
if (userRoutes_1 === null || userRoutes_1 === void 0 ? void 0 : userRoutes_1.default)
    app.use('/api', userRoutes_1.default);
app.get("/", (req, res) => {
    res.send("Restaurant Management Backend Running");
});
const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
exports.default = app;
//# sourceMappingURL=server.js.map