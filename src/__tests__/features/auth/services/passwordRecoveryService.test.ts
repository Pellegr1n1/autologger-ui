import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../../../../features/auth/services/apiAuth', () => ({
  authService: {
    forgotPassword: jest.fn(),
    validateResetToken: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

import { passwordRecoveryService } from '../../../../features/auth/services/passwordRecoveryService';
import { authService } from '../../../../features/auth/services/apiAuth';

describe('passwordRecoveryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPasswordReset', () => {
    it('should call authService.forgotPassword', async () => {
      const mockForgotPassword = authService.forgotPassword as jest.Mock;
      mockForgotPassword.mockResolvedValue({});

      await passwordRecoveryService.requestPasswordReset({ email: 'test@test.com' });

      expect(mockForgotPassword).toHaveBeenCalledWith('test@test.com');
    });

    it('should handle 404 error silently', async () => {
      const mockForgotPassword = authService.forgotPassword as jest.Mock;
      mockForgotPassword.mockRejectedValue({ response: { status: 404 } });

      await expect(
        passwordRecoveryService.requestPasswordReset({ email: 'test@test.com' })
      ).resolves.not.toThrow();
    });
  });

  describe('validateResetToken', () => {
    it('should call authService.validateResetToken and return result', async () => {
      const mockValidateResetToken = authService.validateResetToken as jest.Mock;
      mockValidateResetToken.mockResolvedValue(true);

      const result = await passwordRecoveryService.validateResetToken('test-token');
      
      expect(mockValidateResetToken).toHaveBeenCalledWith('test-token');
      expect(result).toBe(true);
    });

    it('should return false when token is invalid', async () => {
      const mockValidateResetToken = authService.validateResetToken as jest.Mock;
      mockValidateResetToken.mockResolvedValue(false);

      const result = await passwordRecoveryService.validateResetToken('invalid-token');
      
      expect(mockValidateResetToken).toHaveBeenCalledWith('invalid-token');
      expect(result).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with valid passwords', async () => {
      const mockResetPassword = authService.resetPassword as jest.Mock;
      mockResetPassword.mockResolvedValue({});

      await passwordRecoveryService.resetPassword({
        token: 'test-token',
        newPassword: 'Password123!',
        confirmPassword: 'Password123!',
      });

      expect(mockResetPassword).toHaveBeenCalledWith({
        token: 'test-token',
        newPassword: 'Password123!',
        confirmPassword: 'Password123!',
      });
    });

    it('should throw error if passwords do not match', async () => {
      await expect(
        passwordRecoveryService.resetPassword({
          token: 'test-token',
          newPassword: 'Password123!',
          confirmPassword: 'Different123!',
        })
      ).rejects.toThrow('As senhas não coincidem');
    });

    it('should throw error if password is not strong', async () => {
      await expect(
        passwordRecoveryService.resetPassword({
          token: 'test-token',
          newPassword: 'weak',
          confirmPassword: 'weak',
        })
      ).rejects.toThrow();
    });
  });

  describe('isPasswordStrong', () => {
    it('should return true for strong password', () => {
      expect(passwordRecoveryService.isPasswordStrong('Password123!')).toBe(true);
    });

    it('should return false for short password', () => {
      expect(passwordRecoveryService.isPasswordStrong('Pass1!')).toBe(false);
    });

    it('should return false for password without uppercase', () => {
      expect(passwordRecoveryService.isPasswordStrong('password123!')).toBe(false);
    });

    it('should return false for password without lowercase', () => {
      expect(passwordRecoveryService.isPasswordStrong('PASSWORD123!')).toBe(false);
    });

    it('should return false for password without number', () => {
      expect(passwordRecoveryService.isPasswordStrong('Password!')).toBe(false);
    });

    it('should return false for password without special character', () => {
      expect(passwordRecoveryService.isPasswordStrong('Password123')).toBe(false);
    });
  });
});
