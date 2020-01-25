import ConfigurationService from './configuration-service';
import ControllerService from './controller-service';
import DatabaseService from './database-service';
import EnvironmentService from './environment-service';
import ExpressService from './express-service';
import LogService from './log-service';
import ServerService from './server-service';

/**
 * Services container class.
 * 
 * The services container is used to access all services in the code, particulary in controllers or in services themselves.
 * A service is loaded when it is accessed for the first time.
 * 
 * When a service is created, it must be registered here.
 */
export default class ServiceContainer {

    private static INSTANCE: ServiceContainer;

    /**
     * Returns the instance of the services container.
     * 
     * @returns Instance of the services container
     */
    public static getInstance(): ServiceContainer {
        if (!ServiceContainer.INSTANCE) {
            ServiceContainer.INSTANCE = new ServiceContainer();
        }
        return ServiceContainer.INSTANCE;
    }

    private _env: EnvironmentService | null;
    private _express: ExpressService | null;
    private _controllers: ControllerService | null;
    private _db: DatabaseService | null;
    private _srv: ServerService | null;
    private _config: ConfigurationService | null;
    private _log: LogService | null;

    /**
     * Creates a new services container.
     */
    private constructor() {
        this._env = null;
        this._express = null;
        this._controllers = null;
        this._db = null;
        this._srv = null;
        this._config = null;
        this._log = null;
        this.env.load(); // Autoload environment
    }

    public get env(): EnvironmentService {
        if (!this._env) {
            this._env = new EnvironmentService(this);
            this.log.log('Loaded environment service', { type: 'service-container' });
        }
        return this._env;
    }

    public get express(): ExpressService {
        if (!this._express) {
            this._express = new ExpressService(this);
            this.log.log('Loaded Express service', { type: 'service-container' });
        }
        return this._express;
    }

    public get controllers(): ControllerService {
        if (!this._controllers) {
            this._controllers = new ControllerService(this);
            this.log.log('Loaded controllers service', { type: 'service-container' });
        }
        return this._controllers;
    }

    public get db(): DatabaseService {
        if (!this._db) {
            this._db = new DatabaseService(this);
            this.log.log('Loaded database service', { type: 'service-container' });
        }
        return this._db;
    }

    public get srv(): ServerService {
        if (!this._srv) {
            this._srv = new ServerService(this);
            this.log.log('Loaded server service', { type: 'service-container' });
        }
        return this._srv;
    }

    public get config(): ConfigurationService {
        if (!this._config) {
            this._config = new ConfigurationService(this);
            this.log.log('Loaded configuration service', { type: 'service-container' });
        }
        return this._config;
    }

    public get log(): LogService {
        if (!this._log) {
            this._log = new LogService(this);
            this._log.log('Loaded log service', { type: 'service-container' });
        }
        return this._log;
    }
}
