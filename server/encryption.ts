import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Get encryption key from environment or generate a default one (in production, use env var)
const getEncryptionKey = (): string => {
  const key = process.env.ENCRYPTION_KEY;
  
  // In production, fail fast if encryption key is not set
  if (!key && process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_KEY must be set in production environment');
  }
  
  if (!key) {
    console.warn('WARNING: ENCRYPTION_KEY not set in environment variables. Using default key (NOT SECURE for production)');
    // Default key for development - MUST be replaced in production
    return 'default-encryption-key-must-be-changed-in-production-environment';
  }
  
  return key;
};

/**
 * Derives a cryptographic key from the encryption key using PBKDF2
 */
const deriveKey = (salt: Buffer): Buffer => {
  const encryptionKey = getEncryptionKey();
  return crypto.pbkdf2Sync(encryptionKey, salt, 100000, KEY_LENGTH, 'sha512');
};

/**
 * Encrypts sensitive data (like OAuth tokens)
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format: salt:iv:encrypted:authTag
 */
export const encrypt = (text: string): string => {
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from password
    const key = deriveKey(salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the text
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine all parts: salt:iv:encrypted:authTag
    const result = Buffer.concat([salt, iv, encrypted, authTag]);
    
    // Return as base64 string
    return result.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts encrypted data
 * @param encryptedData - Encrypted string from encrypt()
 * @returns Decrypted plain text
 */
export const decrypt = (encryptedData: string): string => {
  try {
    // Convert from base64
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encrypted = buffer.subarray(
      SALT_LENGTH + IV_LENGTH, 
      buffer.length - TAG_LENGTH
    );
    const authTag = buffer.subarray(buffer.length - TAG_LENGTH);
    
    // Derive key from password
    const key = deriveKey(salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Encrypts an OAuth token object
 */
export const encryptOAuthToken = (token: {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  scope?: string;
  token_type?: string;
}): string => {
  return encrypt(JSON.stringify(token));
};

/**
 * Decrypts an OAuth token object
 */
export const decryptOAuthToken = (encryptedToken: string): {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  scope?: string;
  token_type?: string;
} => {
  const decrypted = decrypt(encryptedToken);
  return JSON.parse(decrypted);
};
