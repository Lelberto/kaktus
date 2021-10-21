import dotenv from 'dotenv';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Environment service class.
 * 
 * This service is only used to load environment variables from `.env` file.
 */
export default class EnvironmentService extends Service {

  /**
   * Creates a new environment service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
  }

  /**
   * Loads environment.
   */
  public load(): void {
    dotenv.config();
  }

  /**
   * Gets the current Node environment.
   */
  public get nodeEnv(): NodeEnv {
    return process.env.NODE_ENV as NodeEnv || 'development';
  }
}

/**
 * Node environment type.
 */
export type NodeEnv = 'development' | 'production';
