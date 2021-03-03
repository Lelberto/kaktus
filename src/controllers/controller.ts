import _ from 'lodash';
import { RequestHandler, Router } from 'express';
import Component from '../component';
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
  public readonly endpoints: EndpointExtended[];

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
    const endpointExtended: EndpointExtended = { ...endpoint, calledCount: 0 };
    const updateStatMiddleware: RequestHandler = (req, res, next) => {
      this.updateStat(endpointExtended);
      return next();
    };
    this.endpoints.push(endpointExtended);
    this.bindHandlers(endpoint);
    switch (endpoint.method) {
      default:
      case 'GET':
        this.router.get(endpoint.uri, updateStatMiddleware, endpoint.handlers);
        break;
      case 'POST':
        this.router.post(endpoint.uri, updateStatMiddleware, endpoint.handlers);
        break;
      case 'PUT':
        this.router.put(endpoint.uri, updateStatMiddleware, endpoint.handlers);
        break;
      case 'PATCH':
        this.router.patch(endpoint.uri, updateStatMiddleware, endpoint.handlers);
        break;
      case 'DELETE':
        this.router.delete(endpoint.uri, updateStatMiddleware, endpoint.handlers);
        break;
    }
  }

  /**
   * Binds endpoint's handlers to access to `this`.
   * 
   * @param endpoint Endpoint to bind
   */
  private bindHandlers(endpoint: Endpoint) {
    if (_.isArray(endpoint.handlers)) {
      endpoint.handlers = (endpoint.handlers as RequestHandler[]).map(handler => handler.bind(this));
    } else {
      endpoint.handlers = (endpoint.handlers as RequestHandler).bind(this);
    }
  }

  /**
   * Updates endpoint statistics.
   * 
   * @param endpoint Endpoint to update
   */
  private updateStat(endpoint: EndpointExtended): void {
    endpoint.calledCount++;
  }
}

/**
 * Method type.
 */
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Endpoint.
 */
export interface Endpoint {
  method: Method;
  uri: string;
  handlers: RequestHandler | RequestHandler[];
  description?: string;
}

/**
 * Endpoint extended.
 * 
 * This endpoint has additional statistic fields.
 */
export interface EndpointExtended extends Endpoint {
  calledCount: number;
}

/**
 * HATEOAS Link.
 */
export interface Link {
  rel: string;
  action: Method;
  href: string;
}
