import { NextFunction, Request, Response } from 'express';
import Service from './service';
import ServiceContainer from './service-container';
import { AccessTokenData } from './token-service';

/**
 * Authentication service class.
 * 
 * This service is used to manage authentication for users.
 */
export default class AuthenticationService extends Service {

  /**
   * Creates a new authentication service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
  }

  /**
   * Authenticates an user.
   * 
   * A token must be provided in the request header `x-access-token`. If the token is valid, the user is stored into `res.locals.authUser`.
   * 
   * Note : This handler works even if no token is provided. To block the request, use `isAuthenticatedHandler` after this handler to send an error when authentication
   * is invalid.
   * 
   * This method is a handler.
   * 
   * @param req Express request
   * @param res Express response
   * @param next Next handler
   * @async
   */
  public async authenticateHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers?.authorization?.split(' ')[1];
    if (token != null) {
      try {
        const data = await this.container.tokens.decode<AccessTokenData>(token, process.env.ACCESS_TOKEN_KEY);
        const user = await this.container.db.users.findById(data.userId);
        if (user != null) {
          res.locals.authUser = user;
        }
      } catch (err) {
        this.logger.error('Could not authenticate :', err.message);
      }
    }
    return next();
  }

  /**
   * Checks if an user is authenticated.
   * 
   * If the user is not authenticated, this returns an error with code 401.
   * 
   * This method is a handler.
   * 
   * @param req Express request
   * @param res Express response
   * @param next Next handler
   */
  public async isAuthenticatedHandler(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    return res.locals.authUser ? next() : res.status(401).json(this.container.errors.formatErrors({
      error: 'access_denied',
      error_description: 'Not authenticated'
    }));
  }
}
