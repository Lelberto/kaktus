import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import randomString from 'crypto-random-string';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Crypto service class.
 * 
 * This service is used to hash and compare strings like passwords.
 */
export default class CryptoService extends Service {

  /**
   * Creates a new crypto service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
  }

  /**
   * Hashes a string value.
   * 
   * @param value Value to hash
   * @param salt Salt for hash
   * @returns Hashed value
   * @async
   */
  public async hash(value: string, salt: string | number): Promise<string> {
    return await bcrypt.hash(value, salt);
  }

  /**
   * Compares a value with a hash.
   * 
   * @param value Value to compare
   * @param hash Hash
   * @returns true is the value is equivalent to hash, false otherwise
   * @async
   */
  public async compare(value: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(value, hash);
  }

  /**
   * Generates a random hex-string with the given length.
   * 
   * @param length String length
   */
  public generateRandomString(length: number = 10): string {
    return randomString({ length });
  }

  /**
   * Generates a random numeric-string with the given length.
   * 
   * @param length String length
   */
  public generateRandomNumeric(length: number = 10): string {
    return randomString({ type: 'numeric', length });
  }

  /**
   * Encrypts a value with an algorithm.
   * 
   * @param value Value to encrypt
   * @param algorithm Algorithm to use
   * @returns Encrypted value
   */
  public encrypt(value: string, algorithm: string = 'sha256'): string {
    if (algorithm === 'base64') {
      return Buffer.from(value).toString(algorithm);
    }
    return crypto.createHash(algorithm).update(value).digest('hex');
  }

  /**
   * Verifies if a value matches with the encrypted value.
   * 
   * @param value Value to verify
   * @param encryptedValue Encrypted value
   * @param algorithm Algorithm to use
   * @returns True if the value matches, false otherwise
   */
  public verify(value: string, encryptedValue: string, algorithm: string = 'sha256'): boolean {
    return this.encrypt(value, algorithm) === encryptedValue;
  }
}
