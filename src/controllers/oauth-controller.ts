// TODO Add doc comments
import { Request, Response } from 'express';
import { SignOptions } from 'jsonwebtoken';
import { APIError } from '../services/error-service';
import { GrantType } from '../services/oauth-service';
import ServiceContainer from '../services/service-container';
import { AccessTokenData, RefreshTokenData } from '../services/token-service';
import Controller from './controller';

export default class OAuthController extends Controller {

    public constructor(container: ServiceContainer) {
        super(container, '/oauth');
        this.authorizeHandler = this.authorizeHandler.bind(this);
        this.submitAuthorizeHandler = this.submitAuthorizeHandler.bind(this);
        this.tokenHandler = this.tokenHandler.bind(this);
        this.registerEndpoint({ method: 'GET', uri: '/authorize', handlers: this.authorizeHandler });
        this.registerEndpoint({ method: 'POST', uri: '/authorize/submit', handlers: this.submitAuthorizeHandler });
        this.registerEndpoint({ method: 'POST', uri: '/token', handlers: this.tokenHandler });
    }

    public async authorizeHandler(req: Request, res: Response): Promise<any> {
        const { response_type } = req.query;
        if (response_type == null) {
            return res.status(400).send(this.container.errors.formatErrors(400, {
                error: 'invalid_request',
                error_description: 'response_type parameter is required'
            }));
        }
        switch (response_type) {
            case 'code': return await this.processAuthorization(req, res);
            default: return res.status(400).send(this.container.errors.formatErrors(400, {
                    error: 'invalid_request',
                    error_description: `response_type "${response_type}" is invalid`
            }));
        }
    }

    public async submitAuthorizeHandler(req: Request, res: Response): Promise<any> {
        const { client_id, redirect_uri, scope, state, code_challenge, code_challenge_method, response } = req.body;
        const errors: APIError[] = [];
        if (client_id == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'client_id parameter is required'
            });
        }
        if (redirect_uri == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'redirect_uri parameter is required'
            });
        }
        if (scope == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'scope parameter is required'
            });
        }
        if (state == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'state parameter is required'
            });
        }
        if (response == null) {
            return res.status(400).send(this.container.errors.formatErrors(400, {
                error: 'invalid_request',
                error_description: 'response parameter is required'
            }));
        }
        if (errors.length > 0) {
            return res.status(400).send({
                status: 400,
                errors
            });
        }
        const app = await this.db.applications.findById(client_id);
        if (app == null) {
            return res.status(404).send(this.container.errors.formatErrors(404, {
                error: 'not_found',
                error_description: 'Application not found'
            }));
        }
        const scopeValues = this.translateScope(scope);
        if (scopeValues.length === 0) {
            return res.status(400).send(this.container.errors.formatErrors(400, {
                error: 'invalid_scope',
                error_description: 'Empty scope'
            }));
        }
        switch (response) {
            case 'allow':
                const code = await this.container.oauth.generateAuthorizationCode(client_id, scopeValues, redirect_uri, code_challenge, code_challenge_method);
                this.container.cache.set<string>(`auth_code_${client_id}`, code, parseInt(process.env.AUTHORIZATION_CODE_EXPIRATION, 10));
                return res.redirect(302, `${redirect_uri}?code=${code}&state=${state}`);
            case 'deny':
                const err: APIError = {
                    error: 'access_denied',
                    error_description: 'The user denied the request'
                };
                return res.redirect(302, `${redirect_uri}?${this.container.errors.formatErrorQuery(err)}&state=${state}`);
            default: return res.status(400).send(this.container.errors.formatErrors(400, {
                error: 'invalid_request',
                error_description: `response "${response}" is invalid`
            }));
        }
    }

    public async tokenHandler(req: Request, res: Response): Promise<any> {
        const grant_type: GrantType = req.query.grant_type;
        const code_verifier: string = req.query.code_verifier;
        if (grant_type == null) {
            return res.status(400).send(this.container.errors.formatErrors(400, {
                error: 'invalid_request',
                error_description: 'grant_type parameter is required'
            }));
        }
        switch (grant_type) {
            default:
                return res.status(400).send(this.container.errors.formatErrors(400, {
                    error: 'invalid_grant',
                    error_description: `grant_type "${grant_type}" is invalid`
                }));
            case 'password': return await this.processTokenPassword(req, res);
            case 'authorization_code': return await this.processTokenAuthorizationCode(req, res);
            case 'client_credentials': return await this.processTokenClientCredentials(req, res);
            case 'refresh_token': return await this.processTokenRefreshToken(req, res);
        }
    }

    private async processAuthorization(req: Request, res: Response): Promise<any> {
        const { client_id, redirect_uri, scope, state, code_challenge, code_challenge_method } = req.query;
        const errors: APIError[] = [];
        if (client_id == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'client_id parameter is required'
            });
        }
        if (redirect_uri == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'redirect_uri parameter is required'
            });
        }
        if (scope == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'scope parameter is required'
            });
        }
        if (state == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'state parameter is required'
            });
        }
        if (errors.length > 0) {
            return res.status(400).send({
                status: 400,
                errors
            });
        }
        try {
            const app = await this.db.applications.findById(client_id);
            if (app == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'Application not found'
                }));
            }
            if (!app.enabled) {
                return res.status(403).send(this.container.errors.formatErrors(404, {
                    error: 'access_denied',
                    error_description: 'Application is disabled'
                }));
            }
            if (!app.redirectUris.includes(redirect_uri)) {
                return res.status(400).send(this.container.errors.formatErrors(400, {
                    error: 'invalid_request',
                    error_description: `Redirect URI "${redirect_uri}" is not registered in the application "${app.name}"`
                }));
            }
            const scopeValues = this.translateScope(scope);
            if (scopeValues.length === 0) {
                return res.status(400).send(this.container.errors.formatErrors(400, {
                    error: 'invalid_scope',
                    error_description: 'Empty scope'
                }));
            }
            return res.status(200).render('authorize.html.twig', {
                app,
                client_id,
                redirect_uri,
                scope: scopeValues,
                state,
                code_challenge,
                code_challenge_method,
                callbackUrl: `${req.protocol}://${req.get('host')}${this.rootUri}/authorize/submit`
            });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    private async processTokenPassword(req: Request, res: Response): Promise<any> {
        const { username, password, client_id, client_secret } = req.query;
        const errors: APIError[] = [];
        if (username == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'username parameter is required'
            });
        }
        if (password == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'password parameter is required'
            });
        }
        if (client_id == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'client_id parameter is required'
            });
        }
        if (client_secret == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'client_secret parameter is required'
            });
        }
        if (errors.length > 0) {
            return res.status(400).send({
                status: 400,
                errors
            });
        }
        try {
            const app = await this.db.applications.findById(client_id).select('+secret');
            if (app == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'Application not found'
                }));
            }
            if (!app.enabled) {
                return res.status(403).send(this.container.errors.formatErrors(404, {
                    error: 'access_denied',
                    error_description: 'Application is disabled'
                }));
            }
            if (client_secret !== app.secret) {
                return res.status(403).send(this.container.errors.formatErrors(403, {
                    error: 'access_denied',
                    error_description: 'Invalid client_secret'
                }));
            }
            if (!app.grantTypes.includes('password')) {
                return res.status(403).send(this.container.errors.formatErrors(403, {
                    error: 'access_denied',
                    error_description: 'Application is not allowed to use the "password" grant_type'
                }));
            }
            const user = await this.db.users.findOne({ name: username }).select('+password');
            if (user == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'User not found'
                }));
            }
            if (!await this.container.crypto.compare(password, user.password)) {
                return res.status(401).send(this.container.errors.formatErrors(401, {
                    error: 'access_denied',
                    error_description: 'Invalid password'
                }));
            }
            return res.status(200).send(this.createTokenResponse(await this.createAccessToken({ clientId: client_id }), await this.createRefreshToken({ clientId: client_id })));
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    private async processTokenAuthorizationCode(req: Request, res: Response): Promise<any> {
        const { code, client_id, client_secret, redirect_uri, code_verifier } = req.query;
        const pkce = code_verifier != null;
        const errors: APIError[] = [];
        if (code == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'code parameter is required'
            });
        }
        if (client_id == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'client_id parameter is required'
            });
        }
        if (!pkce && client_secret == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'client_secret parameter is required'
            });
        }
        if (redirect_uri == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'redirect_uri parameter is required'
            });
        }
        if (pkce && !this.container.oauth.verifyCodeVerifier(code_verifier)) {
            errors.push({
                error: 'invalid_request',
                error_description: 'code_verifier is invalid (43-128 characters, A-Z a-z 0-9 -._~)'
            });
        }
        if (errors.length > 0) {
            return res.status(400).send({
                status: 400,
                errors
            });
        }
        try {
            const app = await this.db.applications.findById(client_id).select('+secret');
            if (app == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'Application not found'
                }));
            }
            if (!app.enabled) {
                return res.status(403).send(this.container.errors.formatErrors(404, {
                    error: 'access_denied',
                    error_description: 'Application is disabled'
                }));
            }
            if (!pkce && (client_secret !== app.secret)) {
                return res.status(403).send(this.container.errors.formatErrors(403, {
                    error: 'access_denied',
                    error_description: 'Invalid client_secret'
                }));
            }
            if (!app.grantTypes.includes('authorization_code')) {
                return res.status(403).send(this.container.errors.formatErrors(403, {
                    error: 'access_denied',
                    error_description: 'Application is not allowed to use the "authorization_code" grant_type'
                }));
            }
            if ((this.container.cache.get<string>(`auth_code_${client_id}`) !== code) || !await this.container.oauth.verifyAuthorizationCode(code, client_id, redirect_uri, code_verifier)) {
                return res.status(403).send(this.container.errors.formatErrors(403, {
                    error: 'access_denied',
                    error_description: 'Invalid authorization code'
                }));
            }
            this.container.cache.del(`auth_code_${client_id}`);
            return res.status(200).send(this.createTokenResponse(await this.createAccessToken({ clientId: client_id }), await this.createRefreshToken({ clientId: client_id })));
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    private async processTokenClientCredentials(req: Request, res: Response): Promise<any> {
        const { client_id, client_secret } = req.query;
        const errors: APIError[] = [];
        if (client_id == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'client_id parameter is required'
            });
        }
        if (client_secret == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'client_secret parameter is required'
            });
        }
        if (errors.length > 0) {
            return res.status(400).send({
                status: 400,
                errors
            });
        }
        try {
            const app = await this.db.applications.findById(client_id).select('+secret');
            if (app == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'Application not found'
                }));
            }
            if (!app.enabled) {
                return res.status(403).send(this.container.errors.formatErrors(404, {
                    error: 'access_denied',
                    error_description: 'Application is disabled'
                }));
            }
            if (app.secret !== client_secret) {
                return res.status(403).send(this.container.errors.formatErrors(403, {
                    error: 'access_denied',
                    error_description: 'Invalid client_secret'
                }));
            }
            if (!app.grantTypes.includes('client_credentials')) {
                return res.status(403).send(this.container.errors.formatErrors(403, {
                    error: 'access_denied',
                    error_description: 'Application is not allowed to use the "client_credentials" grant_type'
                }));
            }
            return res.status(200).send(this.createTokenResponse(await this.createAccessToken({ clientId: client_id }), await this.createRefreshToken({ clientId: client_id })));
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    private async processTokenRefreshToken(req: Request, res: Response): Promise<any> {
        const { refresh_token, client_id, client_secret } = req.query;
        const errors: APIError[] = [];
        if (refresh_token == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'refresh_token parameter is required'
            });
        }
        if (client_id == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'client_id parameter is required'
            });
        }
        if (client_secret == null) {
            errors.push({
                error: 'invalid_request',
                error_description: 'client_secret parameter is required'
            });
        }
        if (errors.length > 0) {
            return res.status(400).send({
                status: 400,
                errors
            });
        }
        try {
            const app = await this.db.applications.findById(client_id).select('+secret');
            if (app == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'Application not found'
                }));
            }
            if (!app.enabled) {
                return res.status(403).send(this.container.errors.formatErrors(404, {
                    error: 'access_denied',
                    error_description: 'Application is disabled'
                }));
            }
            if (app.secret !== client_secret) {
                return res.status(403).send(this.container.errors.formatErrors(403, {
                    error: 'access_denied',
                    error_description: 'Invalid client_secret'
                }));
            }
            if (!app.grantTypes.includes('refresh_token')) {
                return res.status(403).send(this.container.errors.formatErrors(403, {
                    error: 'access_denied',
                    error_description: 'Application is not allowed to use the "refresh_token" grant_type'
                }));
            }
            const refreshTokenInDb = await this.db.refreshTokens.findOneAndDelete({ token: refresh_token });
            if (refreshTokenInDb == null) {
                return res.status(403).send(this.container.errors.formatErrors(403, {
                    error: 'access_denied',
                    error_description: 'Invalid refresh token'
                }));
            }
            const refreshToken = await this.container.tokens.decode<RefreshTokenData>(refreshTokenInDb.token, process.env.REFRESH_TOKEN_KEY);
            if (refreshToken.clientId !== app.id) {
                return res.status(403).send(this.container.errors.formatErrors(403, {
                    error: 'access_denied',
                    error_description: 'Invalid refresh token'
                }));
            }
            return res.status(200).send(this.createTokenResponse(await this.createAccessToken({ clientId: client_id }), await this.createRefreshToken({ clientId: client_id })));
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    private async createAccessToken(data: AccessTokenData): Promise<string> {
        return await this.container.tokens.encode(data, process.env.ACCESS_TOKEN_KEY, {
            algorithm: 'HS256',
            expiresIn: process.env.ACCESS_TOKEN_EXPIRATION
        });
    }

    private async createRefreshToken(data: RefreshTokenData): Promise<string> {
        const options: SignOptions = { algorithm: 'HS512' };
        if (parseInt(process.env.REFRESH_TOKEN_EXPIRATION, 10) > 0) { // Expires check
            options.expiresIn = process.env.REFRESH_TOKEN_EXPIRATION;
        }
        const token = await this.container.tokens.encode(data, process.env.REFRESH_TOKEN_KEY, options);
        await this.db.refreshTokens.create({ token, application: data.clientId });
        return token;
    }

    private createTokenResponse(accessToken: string, refreshToken: string) {
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'bearer',
            expires: parseInt(process.env.ACCESS_TOKEN_EXPIRATION, 10)
        };
    }

    private translateScope(scope: string): string[] {
        return scope.replace(' ', '').split(',').filter(value => value.length > 0);
    }
}
