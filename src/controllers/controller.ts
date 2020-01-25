import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import Component from '../component';
import LogService from '../services/log-service';
import ServiceContainer from '../services/service-container';

/**
 * Base controller class.
 * 
 * Controllers are used to create API endpoints and process them.
 * 
 * To create a controller, simply extends this class and register it in the `ControllerService`.
 */
export default abstract class Controller extends Component {

    public readonly rootUri: string;
    public readonly router: Router;
    public readonly endpoints: Endpoint[];

    /**
     * Creates a new controller.
     * 
     * @param container Services container
     * @param rootUri Root URI
     */
    public constructor(container: ServiceContainer, rootUri: string) {
        super(container);
        this.rootUri = rootUri;
        this.router = Router();
        this.endpoints = [];
    }

    /**
     * Registers an endpoint.
     * 
     * @param endpoint Endpoint to register
     */
    protected registerEndpoint(endpoint: Endpoint): void {
        this.endpoints.push(endpoint);
        switch (endpoint.method) {
            default:
            case 'GET':
                this.router.get(endpoint.uri, this.triggerEndpointHandler, endpoint.handlers);
                break;
            case 'POST':
                this.router.post(endpoint.uri, this.triggerEndpointHandler, endpoint.handlers);
                break;
            case 'PUT':
                this.router.put(endpoint.uri, this.triggerEndpointHandler, endpoint.handlers);
                break;
            case 'PATCH':
                this.router.patch(endpoint.uri, this.triggerEndpointHandler, endpoint.handlers);
                break;
            case 'DELETE':
                this.router.delete(endpoint.uri, this.triggerEndpointHandler, endpoint.handlers);
                break;
        }
    }

    /**
     * Send a response.
     * 
     * This method must be called instead of `res.status(...).send(...)` because the log service is used to write some informations about the request and the response.
     * 
     * @param req Express request
     * @param res Express response
     * @param status Status code
     * @param body Response body
     */
    protected async send(req: Request, res: Response, status: number, body: any): Promise<void> {
        res.status(status).send(body);
        this.logger.log(`${req.ip} > Requested ${req.method} ${req.originalUrl} (${this.constructor.name})`);
        this.logger.log(body);
    }

    /**
     * Logs a message when an endpoint is triggered.
     * 
     * This method is a handler.
     * 
     * @param req Express request
     * @param res Express response
     * @param next Next handler
     * @async
     */
    private async triggerEndpointHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
        this.logger.log(`${req.ip} > ${req.method} ${req.originalUrl}`);
        return next();
    }
}

/**
 * Endpoint interface.
 */
export interface Endpoint {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    uri: string;
    handlers: RequestHandler[];
    description?: string;
}
