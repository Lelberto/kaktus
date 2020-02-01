import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import Component from '../component';
import DatabaseService from '../services/database-service';
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
    protected readonly logger: LogService; // Alias for `this.container.log`
    protected readonly db: DatabaseService; // Alias for `this.container.db`

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
        this.logger = container.log;
        this.db = container.db;
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
                this.router.get(endpoint.uri, endpoint.handlers);
                break;
            case 'POST':
                this.router.post(endpoint.uri, endpoint.handlers);
                break;
            case 'PUT':
                this.router.put(endpoint.uri, endpoint.handlers);
                break;
            case 'PATCH':
                this.router.patch(endpoint.uri, endpoint.handlers);
                break;
            case 'DELETE':
                this.router.delete(endpoint.uri, endpoint.handlers);
                break;
        }
    }
}

/**
 * Method type.
 */
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Endpoint interface.
 */
export interface Endpoint {
    method: Method;
    uri: string;
    handlers: RequestHandler | RequestHandler[];
    description?: string;
}

/**
 * HATEOAS Link interface.
 */
export interface Link {
    rel: string;
    action: Method;
    href: string;
}
