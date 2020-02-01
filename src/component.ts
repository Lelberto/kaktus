import ServiceContainer from './services/service-container';

/**
 * Component class.
 * 
 * This class is the base class for any API component (services, controllers, ...).
 */
export default abstract class Component {

    protected readonly container: ServiceContainer;

    public constructor(container: ServiceContainer) {
        this.container = container;
    }
}
