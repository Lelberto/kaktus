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
     * @param clientId Client ID
     * @param scope Scope
     * @param redirectUri Redirect URI
     * @returns Generated ans encoded authorization code
     * @async
     */
    public async generateAuthorizationCode(clientId: string, scope: string[], redirectUri: string): Promise<string> {
        const code = await this.container.tokens.encode<AuthorizationCodeData>({
            clientId,
            scope,
            redirectUri
        }, process.env.AUTHORIZATION_CODE_SECRET, { expiresIn: parseInt(process.env.AUTHORIZATION_CODE_EXPIRATION, 10) });
        return code;
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
    public async verifyAuthorizationCode(code: string, clientId: string, redirectUri: string): Promise<boolean> {
        try {
            const authCode = await this.container.tokens.decode<AuthorizationCodeData>(code, process.env.AUTHORIZATION_CODE_SECRET);
            return (authCode.clientId === clientId) && (authCode.redirectUri === redirectUri);
        } catch (err) {
            return false;
        }
    }
}

/**
 * Grant types type.
 */
export type GrantType = 'authorization_code' | 'password' | 'client_credentials' | 'refresh_token';
