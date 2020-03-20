import Service from './service';
import ServiceContainer from './service-container';
import { AuthorizationCodeData } from './token-service';

/**
 * OAuth service class.
 * 
 * This service groups OAuth2 useful methods.
 */
export default class OAuthService extends Service {

    /**
     * Creates a new OAuth service.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        super(container);
    }

    /**
     * Generates an authorization code.
     * 
     * @param data Data to store in the authorization code
     * @returns Generated and encoded authorization code
     * @async
     */
    public async generateAuthorizationCode(data: AuthorizationCodeData): Promise<string> {
        return await this.container.tokens.encode(data, process.env.AUTHORIZATION_CODE_SECRET, { expiresIn: parseInt(process.env.AUTHORIZATION_CODE_EXPIRATION, 10) });
    }

    /**
     * Verifies an authorization code.
     * 
     * @param code Authorization code to verify
     * @param clientId Client ID
     * @param redirectUri Redirect URI
     * @returns true if the authorization code is valid, false otherwise
     * @async
     */
    public async verifyAuthorizationCode(code: string, clientId: string, redirectUri: string, codeVerifier?: string): Promise<boolean> {
        try {
            const authCode = await this.container.tokens.decode<AuthorizationCodeData>(code, process.env.AUTHORIZATION_CODE_SECRET);
            if (authCode.codeChallenge != null) {
                return (authCode.clientId === clientId) && (authCode.redirectUri === redirectUri) && this.verifyCodeChallenge(codeVerifier, authCode.codeChallenge, authCode.codeChallengeMethod);
            }
            return (authCode.clientId === clientId) && (authCode.redirectUri === redirectUri);
        } catch (err) {
            return false;
        }
    }

    /**
     * Verifies an authorization code.
     * 
     * @param codeVerifier Code verifier
     * @param codeChallenge Code challenge
     * @param codeChallengeMethod Code challenge method (algorithm)
     * @returns true if the code verifier is valid, false otherwise
     */
    public verifyCodeChallenge(codeVerifier: string, codeChallenge: string, codeChallengeMethod: CodeChallengeMethod): boolean {
        let encryptedCodeVerifier = null;
        switch (codeChallengeMethod) {
            default:
            case 'plain':
                encryptedCodeVerifier = codeVerifier;
                break;
            case 'S256':
                encryptedCodeVerifier = this.container.crypto.encrypt(this.container.crypto.encrypt(codeVerifier, 'sha256'), 'base64');
                break;
            case 'S512':
                encryptedCodeVerifier = this.container.crypto.encrypt(this.container.crypto.encrypt(codeVerifier, 'sha512'), 'base64');
                break;
        }
        return encryptedCodeVerifier === codeChallenge;
    }

    /**
     * Verifies if a code verifier is valid.
     * 
     * To be valid, the code verifier must respect the following rules :
     * - Length between 43 and 128 characters
     * - Alphabetical and numerical characters (A-Z a-z 0-9)
     * - Punctuation characters (-._~)
     * 
     * @param codeVerifier Code verifier to verify
     * @returns True if the code verifier is valid, false otherwise
     */
    public verifyCodeVerifier(codeVerifier: string): boolean {
        return /[a-zA-Z\d-._~]{43,128}/g.test(codeVerifier);
    }
}

/**
 * Grant types type.
 */
export type GrantType = 'authorization_code' | 'password' | 'client_credentials' | 'refresh_token';

/**
 * Code challenge methods.
 */
export type CodeChallengeMethod = 'plain' | 'S256' | 'S512';
