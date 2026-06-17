// src/lib/crypto.ts (Full Fixed - Synchronized with seed.ts)
import { scryptSync } from 'crypto';

/**
 * Memverifikasi password input dengan password terenkripsi scryptSync dari database
 */
export function verifyPassword(passwordInput: string, passwordDatabase: string): boolean {
  if (!passwordDatabase || !passwordDatabase.includes(':')) {
    return false;
  }

  // Pisahkan salt dan hash asli dari database
  const [salt, originalHash] = passwordDatabase.split(':');
  
  // Hash kembali password input menggunakan salt yang sama
  const hashedInput = scryptSync(passwordInput, salt, 64).toString('hex');

  // Cocokkan hasilnya
  return hashedInput === originalHash;
}