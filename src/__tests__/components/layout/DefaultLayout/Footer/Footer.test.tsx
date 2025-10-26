import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Footer from '../../../../../components/layout/DefaultLayout/Footer/Footer';

// Mock CSS module
jest.mock('../../../../../components/layout/DefaultLayout/Footer/Footer.module.css', () => ({
  footer: 'footer',
  container: 'container',
  mainContent: 'mainContent',
  linksSection: 'linksSection',
  sectionTitle: 'sectionTitle',
  linksList: 'linksList',
  link: 'link',
  socialSection: 'socialSection',
  socialLinks: 'socialLinks',
  socialButton: 'socialButton',
  bottomBar: 'bottomBar',
  bottomContent: 'bottomContent',
  copyrightCenter: 'copyrightCenter',
  copyright: 'copyright',
}));

describe('DefaultLayout Footer', () => {
  it('should render footer', () => {
    render(<Footer />);
    expect(screen.getByText(/Todos os direitos reservados/i)).toBeInTheDocument();
  });

  it('should render social links', () => {
    render(<Footer />);
    expect(screen.getByText('Links Rápidos')).toBeInTheDocument();
  });

  it('should render legal section', () => {
    render(<Footer />);
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });
});

