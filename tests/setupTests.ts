import '@testing-library/jest-dom/vitest';
import { afterEach, } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

class IOStub {
  constructor(public cb: IntersectionObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}
Object.defineProperty(globalThis, 'IntersectionObserver', {
  value: IOStub,
  writable: true,
  configurable: true, 
});


