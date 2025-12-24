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
// analyticsRoutes temporarily disabled while resolving module artifacts
let tableRoutes;
let queueRoutes;
let reservationRoutes;
let userRoutes;
// Some routes may fail to load during tests if compiled artifacts exist in src; load dynamically with graceful fallback
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    tableRoutes = require('./routes/tableRoutes').default;
}
catch (err) {
    console.warn('Skipping tableRoutes import during test bootstrap:', err);
}
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    queueRoutes = require('./routes/queueRoutes').default;
}
catch (err) {
    console.warn('Skipping queueRoutes import during test bootstrap:', err);
}
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    reservationRoutes = require('./routes/reservationRoutes').default;
}
catch (err) {
    console.warn('Skipping reservationRoutes import during test bootstrap:', err);
}
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    userRoutes = require('./routes/userRoutes').default;
}
catch (err) {
    console.warn('Skipping userRoutes import during test bootstrap:', err);
}
console.log('authRoutes type:', typeof authRoutes_1.default);
console.log('tableRoutes type:', typeof tableRoutes);
if (authRoutes_1.default) {
    // Mount auth under both `/api/auth` and `/api` to preserve compatibility with existing tests
    app.use('/api/auth', authRoutes_1.default);
    app.use('/api', authRoutes_1.default);
}
// if (analyticsRoutes) app.use('/api', analyticsRoutes as any);
if (tableRoutes)
    app.use('/api', tableRoutes);
if (queueRoutes)
    app.use('/api', queueRoutes);
if (reservationRoutes)
    app.use('/api', reservationRoutes);
if (userRoutes)
    app.use('/api', userRoutes);
app.get("/", (_req, res) => {
    res.send("Restaurant Management Backend Running");
});
// DEBUG: list registered route paths (helpful during tests)
try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const routes = app._router?.stack?.filter((s) => s.route).map((s) => s.route.path);
    console.log('Registered routes:', routes);
}
catch (err) {
    console.warn('Could not list routes:', err);
}
const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
exports.default = app;
//# sourceMappingURL=server.js.map