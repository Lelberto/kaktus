import DatabaseService from './services/database-service';
import LogService from './services/log-service';
import ServiceContainer from './services/service-container';

/**
 * Component class.
 * 
 * This class is the base class for any API component (services, controllers, ...).
 */
export default abstract class Component {

    protected readonly container: ServiceContainer;
    protected readonly logger: LogService; // Alias for `this.container.log`
    protected readonly db: DatabaseService; // Alias for `this.container.db`

    public constructor(container: ServiceContainer) {
        this.container = container;
        this.logger = container.log;
        this.db = container.db;
    }
}
