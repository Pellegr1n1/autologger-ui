import { describe, it, expect, jest } from '@jest/globals';
import { render } from '@testing-library/react';
import GlobalWireframe from '../../../../components/common/GlobalWireframe/GlobalWireframe';

// Mock react-three/fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
  useFrame: jest.fn((callback) => {
    if (typeof callback === 'function') {
      callback({});
    }
  }),
}));

// Mock react-three/drei
jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
}));

// Mock three with proper geometry mock
jest.mock('three', () => {
  const mockGeometry = {
    attributes: {
      position: {
        array: new Float32Array([1, 2, 3, 4, 5, 6]),
      },
    },
  };
  
  const mockBufferGeometry = jest.fn().mockImplementation(() => ({
    setAttribute: jest.fn(),
  }));
  
  const mockLineBasicMaterial = jest.fn().mockImplementation(() => ({}));
  
  const mockLine = jest.fn().mockImplementation(() => ({}));
  
  return {
    IcosahedronGeometry: jest.fn(() => mockGeometry),
    Group: jest.fn(),
    BufferGeometry: mockBufferGeometry,
    BufferAttribute: jest.fn(),
    LineBasicMaterial: mockLineBasicMaterial,
    Line: mockLine,
    Float32Array: Float32Array,
    MOUSE: {
      ROTATE: 0,
      DOLLY: 1,
    },
  };
});

describe('GlobalWireframe', () => {
  it('should render global wireframe', () => {
    const { getByTestId } = render(<GlobalWireframe />);
    expect(getByTestId('canvas')).toBeInTheDocument();
  });
});

