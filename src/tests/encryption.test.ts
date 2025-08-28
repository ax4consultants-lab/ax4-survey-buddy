import { describe, it, expect } from 'vitest';
import { encryptData, decryptData } from '@/utils/encryption';

describe('Encryption Utils', () => {
  const testData = { test: 'data', numbers: [1, 2, 3] };
  const passphrase = 'test-passphrase-123';

  it('should encrypt and decrypt data successfully', async () => {
    const encrypted = await encryptData(testData, passphrase);
    expect(encrypted).toBeDefined();
    expect(typeof encrypted).toBe('string');
    
    const decrypted = await decryptData(encrypted, passphrase);
    expect(decrypted).toEqual(testData);
  });

  it('should fail to decrypt with wrong passphrase', async () => {
    const encrypted = await encryptData(testData, passphrase);
    
    await expect(decryptData(encrypted, 'wrong-passphrase')).rejects.toThrow();
  });

  it('should handle empty data', async () => {
    const emptyData = {};
    const encrypted = await encryptData(emptyData, passphrase);
    const decrypted = await decryptData(encrypted, passphrase);
    expect(decrypted).toEqual(emptyData);
  });

  it('should handle complex nested data', async () => {
    const complexData = {
      survey: {
        id: 'test-123',
        items: [
          { id: 1, data: 'test' },
          { id: 2, data: 'test2' }
        ]
      },
      metadata: {
        created: new Date().toISOString(),
        version: '1.0.0'
      }
    };
    
    const encrypted = await encryptData(complexData, passphrase);
    const decrypted = await decryptData(encrypted, passphrase);
    expect(decrypted).toEqual(complexData);
  });
});