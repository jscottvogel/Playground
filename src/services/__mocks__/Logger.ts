/**
 * Shared manual mock for src/services/Logger.
 * Activated by `jest.mock('<path>/services/Logger')` (no factory).
 * Every logger exposes the full ConsoleLogger-style API so new log calls
 * in source code never break tests.
 */
const makeLogger = () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    verbose: jest.fn(),
    log: jest.fn(),
});

export const AuthLogger = makeLogger();
export const AdminLogger = makeLogger();
export const GuestLogger = makeLogger();
export const ChatLogger = makeLogger();
export const GalleryLogger = makeLogger();
export const SystemLogger = makeLogger();
