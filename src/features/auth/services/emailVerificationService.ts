/**
 * Serviço de verificação de email
 * 
 * Endpoints necessários no backend:
 * - POST /api/auth/send-verification-email
 * - POST /api/auth/verify-email/:token
 * - POST /api/auth/resend-verification
 */

import { apiBase } from '../../../shared/services/api';
import { logger } from '../../../shared/utils/logger';

export const emailVerificationService = {
  /**
   * Enviar email de verificação
   */
  async sendVerificationEmail(userId: string): Promise<void> {
    try {
      await apiBase.api.post(`/auth/send-verification-email`, { userId });
    } catch (error) {
      logger.error('Erro ao enviar email de verificação', error);
      throw error;
    }
  },

  /**
   * Verificar email com token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await apiBase.api.post(`/auth/verify-email/${token}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reenviar email de verificação
   */
  async resendVerificationEmail(): Promise<void> {
    try {
      await apiBase.api.post(`/auth/resend-verification`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verificar se usuário precisa verificar email
   */
  async checkVerificationStatus(): Promise<boolean> {
    try {
      const response = await apiBase.api.get('/auth/verification-status');
      return response.data.isEmailVerified || false;
    } catch (error) {
      return false;
    }
  },
};
