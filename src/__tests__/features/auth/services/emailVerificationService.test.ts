import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../../../../shared/services/api', () => ({
  apiBase: {
    api: {
      post: jest.fn(),
      get: jest.fn(),
    },
  },
}));

import { emailVerificationService } from '../../../../features/auth/services/emailVerificationService';
import { apiBase } from '../../../../shared/services/api';

describe('emailVerificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('should call api.post', async () => {
      const mockPost = apiBase.api.post as jest.Mock;
      mockPost.mockResolvedValue({});

      await emailVerificationService.sendVerificationEmail('user-id');

      expect(mockPost).toHaveBeenCalledWith('/auth/send-verification-email', { userId: 'user-id' });
    });

    it('should throw error on failure', async () => {
      const mockPost = apiBase.api.post as jest.Mock;
      mockPost.mockRejectedValue(new Error('Network error'));

      await expect(emailVerificationService.sendVerificationEmail('user-id')).rejects.toThrow();
    });
  });

  describe('verifyEmail', () => {
    it('should call api.post', async () => {
      const mockPost = apiBase.api.post as jest.Mock;
      mockPost.mockResolvedValue({});

      await emailVerificationService.verifyEmail('test-token');

      expect(mockPost).toHaveBeenCalledWith('/auth/verify-email/test-token');
    });

    it('should throw error on failure', async () => {
      const mockPost = apiBase.api.post as jest.Mock;
      mockPost.mockRejectedValue(new Error('Invalid token'));

      await expect(emailVerificationService.verifyEmail('test-token')).rejects.toThrow();
    });
  });

  describe('resendVerificationEmail', () => {
    it('should call api.post', async () => {
      const mockPost = apiBase.api.post as jest.Mock;
      mockPost.mockResolvedValue({});

      await emailVerificationService.resendVerificationEmail();

      expect(mockPost).toHaveBeenCalledWith('/auth/resend-verification');
    });

    it('should throw error on failure', async () => {
      const mockPost = apiBase.api.post as jest.Mock;
      mockPost.mockRejectedValue(new Error('Network error'));

      await expect(emailVerificationService.resendVerificationEmail()).rejects.toThrow();
    });
  });

  describe('checkVerificationStatus', () => {
    it('should return true when verified', async () => {
      const mockGet = apiBase.api.get as jest.Mock;
      mockGet.mockResolvedValue({ data: { isEmailVerified: true } });

      const result = await emailVerificationService.checkVerificationStatus();
      expect(result).toBe(true);
    });

    it('should return false when not verified', async () => {
      const mockGet = apiBase.api.get as jest.Mock;
      mockGet.mockResolvedValue({ data: { isEmailVerified: false } });

      const result = await emailVerificationService.checkVerificationStatus();
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      const mockGet = apiBase.api.get as jest.Mock;
      mockGet.mockRejectedValue(new Error('Network error'));

      const result = await emailVerificationService.checkVerificationStatus();
      expect(result).toBe(false);
    });
  });
});
