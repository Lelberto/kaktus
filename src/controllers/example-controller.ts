import { Request, Response } from 'express';
import ServiceContainer from '../services/service-container';
import Controller from './controller';

/**
 * Example controller class.
 * 
 * This class is only used to show how a controller is implemented and registered in the framework.
 * You can remove this file and unregister the controller in the controllers service (simply remove the line `new ExampleController(container)` in the service constructor).
 */
export default class ExampleController extends Controller {

    /**
     * Creates a new example controller.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        super(container, '/example');
        this.helloWorldHandler = this.helloWorldHandler.bind(this); // Bind to get "this" keyword operational
        this.allControllersHandler = this.allControllersHandler.bind(this); // Bind to get "this" keyword operational
        this.registerEndpoint({ method: 'GET', uri: '/helloworld', handlers: this.helloWorldHandler, description: 'Hello World message' }); // Register endpoint
        this.registerEndpoint({ method: 'GET', uri: '/controllers', handlers: this.allControllersHandler, description: 'Gets all registered controllers names' }); // Register endpoint
    }

    /**
     * Hello World message.
     * 
     * This method is an endpoint :
     * - Method : `GET`
     * - URI : `/helloworld`
     * 
     * @param req Express request
     * @param res Express response
     */
    public async helloWorldHandler(req: Request, res: Response): Promise<any> {
        return res.status(200).send({
            message: 'Hello World'
        });
    }

    /**
     * Gets all registered controllers names.
     * 
     * This method is an endpoint :
     * - Method : `GET`
     * - URI : `/controllers`
     * 
     * @param req Express request
     * @param res Express response
     */
    public async allControllersHandler(req: Request, res: Response): Promise<any> {
        return res.status(200).send({
            controllers: this.container.controllers.controllers.map(controller => controller.constructor.name)
        });
    }
}
