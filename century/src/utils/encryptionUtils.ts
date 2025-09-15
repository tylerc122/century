import CryptoJS from 'crypto-js';

/**
 * Encrypts text using AES encryption
 * @param text Text to encrypt
 * @param password Password to use for encryption
 * @returns Encrypted text
 */
export const encryptText = (text: string, password: string): string => {
  if (!text || !password) return text;
  return CryptoJS.AES.encrypt(text, password).toString();
};

/**
 * Decrypts text using AES encryption
 * @param encryptedText Text to decrypt
 * @param password Password to use for decryption
 * @returns Decrypted text or empty string if decryption fails
 */
export const decryptText = (encryptedText: string, password: string): string => {
  if (!encryptedText || !password) return encryptedText;
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};

/**
 * Checks if a string is encrypted using AES
 * This is a heuristic approach - encrypted content typically starts with 'U2FsdGVk'
 * which is the Base64 encoding of 'Salted__' that CryptoJS prepends
 */
export const isEncrypted = (text: string): boolean => {
  if (!text) return false;
  return text.startsWith('U2FsdGVk');
};
