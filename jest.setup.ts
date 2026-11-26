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
