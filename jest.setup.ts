import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

Object.defineProperty(global, 'TextEncoder', {
  value: TextEncoder
});

Object.defineProperty(global, 'TextDecoder', {
  value: TextDecoder
});

// jsdom does not implement scrolling APIs; polyfill them for components that auto-scroll.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function () { /* no-op in jsdom */ } as typeof Element.prototype.scrollTo;
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () { /* no-op in jsdom */ };
}
// jsdom defines window.scrollTo but it logs "Not implemented" errors; replace with a no-op.
window.scrollTo = (() => { /* no-op in jsdom */ }) as typeof window.scrollTo;

// Guard rail: any console.error / console.warn while tests load or run (React act()
// warnings, "Amplify has not been configured", errors logged by components) fails the run.
// The spy is installed at setup time so warnings emitted while test modules are imported
// are caught too. Messages are reported from afterEach/afterAll rather than thrown inline,
// because throwing inside async React callbacks would crash the worker.
// Tests that intentionally exercise error paths should spy on console themselves.
const consoleProblems: string[] = [];
const recordConsole = (method: 'error' | 'warn') => (...args: unknown[]) => {
  consoleProblems.push(`console.${method}: ${require('util').format(...args).split('\n')[0]}`);
};
console.error = recordConsole('error');
console.warn = recordConsole('warn');
const assertNoConsoleProblems = () => {
  if (consoleProblems.length) {
    const problems = consoleProblems.splice(0);
    throw new Error(`Unexpected console output during test:\n${problems.join('\n')}`);
  }
};
afterEach(assertNoConsoleProblems);
afterAll(assertNoConsoleProblems);
