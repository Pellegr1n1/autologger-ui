import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveStyle(css: string | Record<string, any>): R;
    }
  }
}

// Extend expect with jest-dom matchers
declare global {
  namespace Vi {
    interface Assertion<T = any> extends jest.Matchers<void, T> {}
    interface AsymmetricMatchersContaining extends jest.Matchers<void, any> {}
  }
}
