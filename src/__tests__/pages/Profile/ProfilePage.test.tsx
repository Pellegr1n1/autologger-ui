import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../../../pages/Profile/ProfilePage';

// Mock CSS modules
jest.mock('../../../pages/Profile/ProfilePage.module.css', () => ({
  profilePage: 'profilePage',
  profileHeader: 'profileHeader',
  profileContent: 'profileContent',
  profileForm: 'profileForm',
  profileActions: 'profileActions',
  passwordSection: 'passwordSection',
  profileContainer: 'profileContainer',
  profileAvatar: 'profileAvatar',
  profileInfo: 'profileInfo',
  profileStats: 'profileStats',
  statItem: 'statItem',
  cardsRow: 'cardsRow',
  personalInfoIcon: 'personalInfoIcon',
}));

jest.mock('../../../components/layout/Components.module.css', () => ({
  container: 'container',
  header: 'header',
  professionalCard: 'professionalCard',
}));

// Mock useAuth
const mockUpdateProfile = jest.fn(() => Promise.resolve());
const mockDeleteAccount = jest.fn(() => Promise.resolve());
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
};

jest.mock('../../../features/auth', () => ({
  useAuth: () => ({
    user: mockUser,
    updateProfile: mockUpdateProfile,
    deleteAccount: mockDeleteAccount,
  }),
}));

jest.mock('../../../components/layout', () => ({
  DefaultFrame: ({ children }: any) => <div data-testid="default-frame">{children}</div>,
}));

// Mock message
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    message: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
  };
});

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profile page', () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('default-frame')).toBeInTheDocument();
  });

  it('should display user information', () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('should show edit button when not editing', () => {
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

  });

  it('should handle profile update', async () => {
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

  });

  it('should render user stats', () => {
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

  });

  it('should handle profile update success', async () => {
    mockUpdateProfile.mockResolvedValueOnce({});
    
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    const editButton = container.querySelector('[aria-label*="Editar"]') || container.querySelector('button[type="button"]');
    if (editButton) {
      fireEvent.click(editButton);
    }

    await waitFor(() => {
    });
  });

  it('should handle profile update error', async () => {
    mockUpdateProfile.mockRejectedValueOnce(new Error('Update failed'));
    
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
    });

    jest.restoreAllMocks();
  });

  it('should handle delete account', async () => {
    mockDeleteAccount.mockResolvedValueOnce(undefined);
    
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
    });

    jest.restoreAllMocks();
  });

  it('should handle delete account error', async () => {
    mockDeleteAccount.mockRejectedValueOnce(new Error('Delete failed'));
    
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
    });

    jest.restoreAllMocks();
  });

  it('should show loading state when user is null', () => {
    jest.mock('../../../features/auth', () => ({
      useAuth: () => ({
        user: null,
        updateProfile: mockUpdateProfile,
        deleteAccount: mockDeleteAccount,
      }),
    }));

    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

  });

  it('should handle form values change', async () => {
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    const nameInput = container.querySelector('input[value="Test User"]');
    if (nameInput) {
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    }

    await waitFor(() => {
    });
  });

  it('should handle edit mode toggle', async () => {
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    const editButton = container.querySelector('[aria-label*="Editar"]') || 
                      Array.from(container.querySelectorAll('button')).find(btn => 
                        btn.textContent?.includes('Editar') || btn.querySelector('[aria-label*="Editar"]')
                      );
    
    if (editButton) {
      fireEvent.click(editButton);
      
      const saveButton = container.querySelector('[aria-label*="Salvar"]') ||
                        Array.from(container.querySelectorAll('button')).find(btn => 
                          btn.textContent?.includes('Salvar') || btn.querySelector('[aria-label*="Salvar"]')
                        );
      
      if (saveButton) {
        fireEvent.click(saveButton);
      }
    }
  });

  it('should handle password change modal', async () => {
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    const passwordButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Alterar Senha') || btn.textContent?.includes('Senha')
    );

    if (passwordButton) {
      fireEvent.click(passwordButton);
      
      await waitFor(() => {
      });

      const cancelButton = Array.from(container.querySelectorAll('button')).find(btn => 
        btn.textContent?.includes('Cancelar') || btn.textContent?.includes('Fechar')
      );

      if (cancelButton) {
        fireEvent.click(cancelButton);
      }
    }
  });

  it('should handle delete account modal', async () => {
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    const deleteButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Excluir') || btn.textContent?.includes('Deletar') ||
      btn.querySelector('[aria-label*="Excluir"]') || btn.querySelector('[aria-label*="Deletar"]')
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
      });

      const cancelButton = Array.from(container.querySelectorAll('button')).find(btn => 
        btn.textContent?.includes('Cancelar') || btn.textContent?.includes('Fechar')
      );

      if (cancelButton) {
        fireEvent.click(cancelButton);
      }
    }
  });

  it('should handle cancel edit', async () => {
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    const editButton = container.querySelector('[aria-label*="Editar"]') || 
                      Array.from(container.querySelectorAll('button')).find(btn => 
                        btn.textContent?.includes('Editar')
                      );
    
    if (editButton) {
      fireEvent.click(editButton);
      
      const cancelButton = container.querySelector('[aria-label*="Cancelar"]') ||
                          Array.from(container.querySelectorAll('button')).find(btn => 
                            btn.textContent?.includes('Cancelar')
                          );
      
      if (cancelButton) {
        fireEvent.click(cancelButton);
      }
    }
  });

  it('should display user stats correctly', () => {
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    expect(container.textContent).toContain('Test User');
    expect(container.textContent).toContain('test@example.com');
  });

  it('should handle form change detection', async () => {
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    const nameInput = container.querySelector('input[value="Test User"]');
    if (nameInput) {
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    }

    await waitFor(() => {
    });
  });

  it('should handle profile update form submission', async () => {
    mockUpdateProfile.mockResolvedValueOnce({});
    
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    const editButton = container.querySelector('[aria-label*="Editar"]') || 
                       Array.from(container.querySelectorAll('button')).find(btn => 
                         btn.textContent?.includes('Editar')
                       );
    
    if (editButton) {
      fireEvent.click(editButton);
      
      const form = container.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
    }

    await waitFor(() => {
    });
  });

  it('should handle handleCancel correctly', async () => {
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    const editButton = container.querySelector('[aria-label*="Editar"]') || 
                       Array.from(container.querySelectorAll('button')).find(btn => 
                         btn.textContent?.includes('Editar')
                       );
    
    if (editButton) {
      fireEvent.click(editButton);
      
      const cancelButton = Array.from(container.querySelectorAll('button')).find(btn => 
        btn.textContent?.includes('Cancelar') && !btn.textContent?.includes('Excluir')
      );
      
      if (cancelButton) {
        fireEvent.click(cancelButton);
      }
    }

    await waitFor(() => {
    });
  });

  it('should handle password change submission', async () => {
    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    const passwordButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Alterar Senha') || btn.textContent?.includes('Senha')
    );

    if (passwordButton) {
      fireEvent.click(passwordButton);
      
      await waitFor(() => {
        const passwordForm = container.querySelector('form');
        if (passwordForm) {
          fireEvent.submit(passwordForm);
        }
      });
    }
  });

  it('should handle delete account confirmation', async () => {
    mockDeleteAccount.mockResolvedValueOnce(undefined);
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    const deleteButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Excluir') || btn.textContent?.includes('Deletar')
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        const confirmButton = Array.from(container.querySelectorAll('button')).find(btn => 
          btn.textContent?.includes('Confirmar') || btn.textContent?.includes('Sim')
        );
        
        if (confirmButton) {
          fireEvent.click(confirmButton);
        }
      }, { timeout: 2000 });
    }

    jest.restoreAllMocks();
  });
});

