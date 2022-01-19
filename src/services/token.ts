import jwt from 'jsonwebtoken';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Tokens service class.
 * 
 * This service is used to encode / decode tokens.
 */
export default class TokenService extends Service {

  /**
   * Creates a new tokens service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
  }

  /**
   * Encodes a token.
   * 
   * @param data Token data
   * @param key Token key
   * @param options Token options
   * @returns Token string
   * @async
   */
  public async encode<T extends TokenData>(data: T, key: string, options?: jwt.SignOptions): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
      jwt.sign(data, key, options || {}, (err, token) => {
        if (err) {
          return reject(err);
        }
        return resolve(token);
      });
    });
  }

  /**
   * Decodes a token.
   * 
   * @param data Token data
   * @param key Token key
   * @param options Token options
   * @returns Token data
   * @async
   */
  public async decode<T extends TokenData>(token: string, key: string, options?: jwt.VerifyOptions): Promise<T> {
    return await new Promise<T>((resolve, reject) => {
      jwt.verify(token, key, options, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data as T);
      });
    });
  }
}

/**
 * Token data.
 */
export interface TokenData {
  userId?: string;
}

/**
 * Access token data.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AccessTokenData extends TokenData {}

/**
 * Refresh token data.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RefreshTokenData extends TokenData {}
