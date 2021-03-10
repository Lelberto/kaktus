import cors from 'cors';
import express from 'express';
import mung from 'express-mung';
import helmet from 'helmet';
import { Server } from 'http';
import swagger from 'swagger-ui-express';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Express service class.
 * 
 * This service manages the Express application.
 */
export default class ExpressService extends Service {

  private readonly app: express.Application;
  private srv: Server | null;

  /**
   * Creates a new Express service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
    this.app = this.createApplication();
    this.srv = null;
  }

  /**
   * Starts Express application.
   * 
   * @param port Listening port
   * @async
   */
  public async start(port: number = 80): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      if (!this.srv || !this.srv.listening) {
        this.srv = this.app.listen(port, resolve);
      } else {
        reject(new Error('Server is already started'));
      }
    });
  }

  /**
   * Stops Express application.
   * 
   * @async
   */
  public async stop(): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      if (this.srv && this.srv.listening) {
        this.srv.close(err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        reject(new Error('Server is already stopped'));
      }
    });
  }

  /**
   * Creates express Application.
   * 
   * @returns Express application
   */
  private createApplication(): express.Application {
    const app: express.Application = express();

    // Security
    app.use(express.urlencoded({
      extended: true,
      limit: this.container.config.services.express.requestSizeLimit
    }));
    app.use(express.json());
    app.use(helmet());
    app.use(cors());

    // Set response locals
    app.use((req, res, next) => {
      res.locals.data = {
        start: Date.now()
      };
      return next();
    });

    // Logging request and response
    app.use(mung.json((body, req, res) => {
      this.logger.info(`${req.ip} > Requested ${req.method} ${req.originalUrl} in ${Date.now() - res.locals.data.start} ms`);
      this.logger.info(body);
    }, { mungError: true }));

    // Swagger documentation
    const docRoute = this.container.config.api.documentationRoute;
    if (docRoute != null) {
      app.use(docRoute, swagger.serve, swagger.setup(this.container.config.loadSync('config/swagger.yml', 'YAML')));
      this.logger.info('Loaded Swagger documentation');
    }

    // Registering controllers
    this.container.controllers.registerControllers(app);

    // handler used when no endpoint matches
    app.all('*', (req, res) => {
      return res.status(404).json(this.container.errors.formatErrors({ error: 'not_found', error_description: `Unknown endpoint ${req.method} ${req.originalUrl}` }));
    });

    return app;
  }
}
