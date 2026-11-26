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

// Guard rail: any console.error / console.warn during a test (e.g. React act() warnings,
// unhandled errors logged by components) fails that test. Messages are collected and
// reported in afterEach, because throwing from inside async React callbacks would crash
// the worker. Tests that intentionally exercise error paths should spy on console themselves.
const consoleProblems: string[] = [];
(['error', 'warn'] as const).forEach((method) => {
  beforeEach(() => {
    jest.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      consoleProblems.push(`console.${method}: ${require("util").format(...args).split("\n")[0]}`);
    });
  });
});
afterEach(() => {
  jest.restoreAllMocks();
  if (consoleProblems.length) {
    const problems = consoleProblems.splice(0);
    throw new Error(`Unexpected console output during test:\n${problems.join('\n')}`);
  }
});
