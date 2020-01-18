import ServiceContainer from './service-container';

/**
 * Base service class.
 * 
 * Services are modules that can manage differents parts of the API, like databases, controllers or authentication.
 * 
 * To create a service, simply extends this class and register it in the `ServiceContainer`.
 */
export default abstract class Service {

    protected readonly container: ServiceContainer;

    /**
     * Creates a new service.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        this.container = container;
    }
}
