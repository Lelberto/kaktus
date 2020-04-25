import { Application } from 'express';
import Controller from '../controllers/controller';
import UserController from '../controllers/user-controller';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Controllers service class.
 * 
 * This service manages controllers.
 * 
 * When a controller is created, it must be registered in this service.
 */
export default class ControllerService extends Service {

    public readonly controllers: Controller[];

    /**
     * Creates a new controllers service.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        super(container);
        this.controllers = [
            new UserController(container)
        ];
    }

    /**
     * Register all controllers.
     * 
     * @param app Express application
     */
    public registerControllers(app: Application): void {
        this.controllers.forEach(controller => {
            app.use(controller.rootUri, controller.router);
            this.container.log.info(`Registered controller ${controller.constructor.name} - "${controller.rootUri}"`);
            controller.endpoints.forEach(endpoint => {
                const description = (endpoint.description !== undefined) ? ` (${endpoint.description})` : '';
                this.container.log.info(`    - ${endpoint.method} "${controller.rootUri}${endpoint.uri}"${description}`);
            });
        });
    }
}
