// Server-side bootstrap is not required for the current build system.
// Keep a minimal placeholder to satisfy the build.
export default function serverBootstrap() {
    // no-op placeholder for SSR
    return Promise.resolve();
}
