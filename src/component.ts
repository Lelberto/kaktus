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

  public constructor(container: ServiceContainer) {
    this.container = container;
  }

  /**
   * Alias for `this.container.log`
   */
  protected get logger(): LogService {
      return this.container.logger;
  }

  /**
   * Alias for `this.container.db`
   */
  protected get db(): DatabaseService {
      return this.container.db;
  }
}
