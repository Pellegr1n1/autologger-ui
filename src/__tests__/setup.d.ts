/// <reference types="@testing-library/jest-dom" />
/// <reference types="jest" />

import '@testing-library/jest-dom';

declare global {
  namespace jest {
    type SpyInstance = import('jest-mock').SpyInstance;
  }
}

