import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import NotFoundPage from '../../../pages/NotFound/NotFoundPage';

// Mock CSS modules
jest.mock('../../../pages/NotFound/NotFoundPage.module.css', () => ({}));

describe('NotFoundPage', () => {
  it('should render without crashing', () => {
    render(<NotFoundPage />);
    const heading = screen.getByText(/404/i);
    expect(heading).toBeInTheDocument();
  });

  it('should display the main heading', () => {
    render(<NotFoundPage />);
    const title = screen.getByText(/Página não encontrada/i);
    expect(title).toBeInTheDocument();
  });

  it('should display a message to the user', () => {
    render(<NotFoundPage />);
    const message = screen.getByText(/Ops! Parece que você se perdeu/i);
    expect(message).toBeInTheDocument();
  });

  it('should have buttons to navigate', () => {
    render(<NotFoundPage />);
    const homeButton = screen.getByText(/Voltar ao Início/i);
    const backButton = screen.getByText(/Página Anterior/i);
    expect(homeButton).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();
  });
});

