import { describe, it, expect, beforeEach } from 'vitest';
import { encrypt, decrypt, encryptOAuthToken, decryptOAuthToken } from '../../server/encryption';

describe('Encryption Service', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const plainText = 'sensitive data';
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plainText);
      expect(encrypted).not.toBe(plainText);
    });

    it('should produce different encrypted outputs for the same input', () => {
      const plainText = 'test data';
      const encrypted1 = encrypt(plainText);
      const encrypted2 = encrypt(plainText);
      
      // Different due to random salt and IV
      expect(encrypted1).not.toBe(encrypted2);
      
      // But both decrypt to the same value
      expect(decrypt(encrypted1)).toBe(plainText);
      expect(decrypt(encrypted2)).toBe(plainText);
    });

    it('should handle empty strings', () => {
      const plainText = '';
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plainText);
    });

    it('should handle special characters', () => {
      const plainText = 'Special chars: ñáéíóú @#$%^&*() 日本語 🎉';
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plainText);
    });

    it('should handle long text', () => {
      const plainText = 'A'.repeat(10000);
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plainText);
    });

    it('should throw error when decrypting invalid data', () => {
      expect(() => decrypt('invalid-encrypted-data')).toThrow('Failed to decrypt data');
    });

    it('should throw error when decrypting tampered data', () => {
      const plainText = 'test data';
      const encrypted = encrypt(plainText);
      
      // Tamper with the encrypted data
      const tampered = encrypted.slice(0, -5) + 'XXXXX';
      
      expect(() => decrypt(tampered)).toThrow('Failed to decrypt data');
    });
  });

  describe('OAuth token encryption', () => {
    it('should encrypt and decrypt OAuth token object', () => {
      const token = {
        access_token: 'ya29.a0AfH6SMBx...',
        refresh_token: '1//0gHBm5ZQvU...',
        expiry_date: 1234567890,
        scope: 'https://www.googleapis.com/auth/calendar',
        token_type: 'Bearer'
      };

      const encrypted = encryptOAuthToken(token);
      const decrypted = decryptOAuthToken(encrypted);

      expect(decrypted).toEqual(token);
    });

    it('should handle minimal OAuth token', () => {
      const token = {
        access_token: 'test-access-token'
      };

      const encrypted = encryptOAuthToken(token);
      const decrypted = decryptOAuthToken(encrypted);

      expect(decrypted).toEqual(token);
    });

    it('should preserve all token properties', () => {
      const token = {
        access_token: 'access',
        refresh_token: 'refresh',
        expiry_date: Date.now() + 3600000,
        scope: 'calendar.readonly',
        token_type: 'Bearer'
      };

      const encrypted = encryptOAuthToken(token);
      const decrypted = decryptOAuthToken(encrypted);

      expect(decrypted.access_token).toBe(token.access_token);
      expect(decrypted.refresh_token).toBe(token.refresh_token);
      expect(decrypted.expiry_date).toBe(token.expiry_date);
      expect(decrypted.scope).toBe(token.scope);
      expect(decrypted.token_type).toBe(token.token_type);
    });
  });
});
