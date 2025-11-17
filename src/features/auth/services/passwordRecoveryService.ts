/**
 * Serviço de recuperação de senha
 * 
 * Endpoints necessários no backend:
 * - POST /api/auth/forgot-password
 * - POST /api/auth/reset-password/:token
 */

import { authService } from './apiAuth';

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export const passwordRecoveryService = {
  /**
   * Solicitar reset de senha
   * Deve retornar mensagem genérica (não revelar se email existe)
   */
  async requestPasswordReset(data: ForgotPasswordRequest): Promise<void> {
    try {
      await authService.forgotPassword(data.email);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return;
      }
      throw error;
    }
  },

  /**
   * Validar token de reset
   */
  async validateResetToken(token: string): Promise<boolean> {
    return await authService.validateResetToken(token);
  },

  /**
   * Resetar senha com token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('As senhas não coincidem');
    }

    if (!this.isPasswordStrong(data.newPassword)) {
      throw new Error('A senha não atende aos requisitos mínimos de segurança');
    }

    await authService.resetPassword({
      token: data.token,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  },

  /**
   * Validar força da senha
   */
  isPasswordStrong(password: string): boolean {
    // Mínimo 8 caracteres
    if (password.length < 8) return false;
    
    // Deve conter letra maiúscula
    if (!/[A-Z]/.test(password)) return false;
    
    // Deve conter letra minúscula
    if (!/[a-z]/.test(password)) return false;
    
    // Deve conter número
    if (!/\d/.test(password)) return false;
    
    // Deve conter caractere especial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    
    return true;
  },
};
