import Service from './service';
import ServiceContainer from './service-container';

/**
 * Server service class.
 * 
 * This service allows to start and stop the server (API).
 */
export default class ServerService extends Service {

  /**
   * Creates a new server service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
  }

  /**
   * Starts the server.
   * 
   * @async
   */
  public async start(): Promise<void> {
    const { API_PORT, DB_HOST, DB_PORT, DB_NAME } = process.env;

    // Starting server
    await this.container.express.start(API_PORT as unknown as number);
    this.logger.info('Express started');

    // Connecting to database
    await this.container.db.connect(DB_HOST, DB_PORT, DB_NAME);
    this.logger.info(`Connected to database ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  }

  /**
   * Stops the server.
   * 
   * @async
   */
  public async stop(): Promise<void> {
    // Stopping all tasks
    this.container.scheduler.stopAllTasks();

    // Stopping server
    await this.container.express.stop();
    this.logger.info('Server stopped');

    // Disconnecting from database
    await this.container.db.disconnect();
    this.logger.info('Disconnected from database');
  }
}
