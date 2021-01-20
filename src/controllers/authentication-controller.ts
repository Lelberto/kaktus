import { Request, Response } from 'express';
import ServiceContainer from '../services/service-container';
import { AccessTokenData, RefreshTokenData } from '../services/token-service';
import Controller from './controller';

/**
 * Authentication controller class.
 * 
 * Root path : `/auth`
 */
export default class AuthenticationController extends Controller {

    /**
     * Creates a new authentication controller.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        super(container, '/auth');
        this.registerEndpoint({ method: 'POST', uri: '/accessToken', handlers: this.accessToken });
        this.registerEndpoint({ method: 'POST', uri: '/refreshToken', handlers: this.refreshToken });
    }

    /**
     * Gets a new access token with a refresh token.
     * 
     * Path: `POST /accessToken`
     * 
     * @param req Express request
     * @param res Express response
     */
    public async accessToken(req: Request, res: Response): Promise<Response> {
        try {
            const user = await this.db.users.findOne({ refreshToken: req.body.refresh_token });
            if (user == null) {
                return res.status(404).json(this.container.errors.formatErrors({
                    error: 'access_denied',
                    error_description: 'Invalid refresh token'
                }));
            }
            const accessToken = await this.container.tokens.encode<AccessTokenData>({ userId: user.id }, process.env.ACCESS_TOKEN_KEY, {
                expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRATION, 10)
            });
            return res.status(200).json({ access_token: accessToken });
        } catch (err) {
            return res.status(500).json(this.container.errors.formatServerError());
        }
    }

    /**
     * Gets a new refresh token.
     * 
     * An access token is also returned.
     * 
     * Path : `POST /refreshToken`
     * 
     * @param req Express request
     * @param res Express response
     */
    public async refreshToken(req: Request, res: Response): Promise<Response> {
        try {
            const user = await this.db.users.findOne({ email: req.body.email }).select('+password');
            if (user == null) {
                return res.status(404).json(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'User not found with this email'
                }));
            }
            if (req.body.password == null || !await this.container.crypto.compare(req.body.password, user.password)) {
                return res.status(401).json(this.container.errors.formatErrors({
                    error: 'access_denied',
                    error_description: 'Incorrect password'
                }));
            }
            const accessToken = await this.container.tokens.encode<AccessTokenData>({ userId: user.id }, process.env.ACCESS_TOKEN_KEY, {
                expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRATION, 10)
            });
            const refreshToken = await this.container.tokens.encode<RefreshTokenData>({ userId: user.id }, process.env.REFRESH_TOKEN_KEY, {
                expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRATION, 10)
            });
            user.refreshToken = refreshToken;
            await user.save();
            return res.status(200).json({ access_token: accessToken, refresh_token: refreshToken });
        } catch (err) {
            return res.status(500).json(this.container.errors.formatServerError());
        }
    }
}
