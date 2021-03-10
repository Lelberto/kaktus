import AuthenticationService from './authentication-service';
import CacheService from './cache-service';
import ConfigurationService from './configuration-service';
import ControllerService from './controller-service';
import CryptoService from './crypto-service';
import DatabaseService from './database-service';
import EnvironmentService from './environment-service';
import ErrorService from './error-service';
import ExpressService from './express-service';
import LogService from './log-service';
import SchedulerService from './scheduler-service';
import ServerService from './server-service';
import TokenService from './token-service';
import WebsocketService from './websocket-service';

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

  private _env: EnvironmentService;
  private _express: ExpressService;
  private _controllers: ControllerService;
  private _db: DatabaseService;
  private _srv: ServerService;
  private _config: ConfigurationService;
  private _logger: LogService;
  private _auth: AuthenticationService;
  private _tokens: TokenService;
  private _crypto: CryptoService;
  private _errors: ErrorService;
  private _cache: CacheService;
  private _scheduler: SchedulerService;
  private _websocket: WebsocketService;

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
    this._logger = null;
    this._auth = null;
    this._tokens = null;
    this._crypto = null;
    this._errors = null;
    this._cache = null;
    this._scheduler = null;
    this._websocket = null;
    this.env.load(); // Autoload environment
  }

  public get env(): EnvironmentService {
    if (!this._env) {
      this._env = new EnvironmentService(this);
      this.logger.info('Loaded environment service');
    }
    return this._env;
  }

  public get express(): ExpressService {
    if (!this._express) {
      this._express = new ExpressService(this);
      this.logger.info('Loaded Express service');
    }
    return this._express;
  }

  public get controllers(): ControllerService {
    if (!this._controllers) {
      this._controllers = new ControllerService(this);
      this.logger.info('Loaded controllers service');
    }
    return this._controllers;
  }

  public get db(): DatabaseService {
    if (!this._db) {
      this._db = new DatabaseService(this);
      this.logger.info('Loaded database service');
    }
    return this._db;
  }

  public get srv(): ServerService {
    if (!this._srv) {
      this._srv = new ServerService(this);
      this.logger.info('Loaded server service');
    }
    return this._srv;
  }

  public get config(): ConfigurationService {
    if (!this._config) {
      this._config = new ConfigurationService(this);
      this.logger.info('Loaded configuration service');
    }
    return this._config;
  }

  public get logger(): LogService {
    if (!this._logger) {
      this._logger = new LogService(this);
      this._logger.info('Loaded log service');
    }
    return this._logger;
  }

  public get auth(): AuthenticationService {
    if (!this._auth) {
      this._auth = new AuthenticationService(this);
      this.logger.info('Loaded authentication service');
    }
    return this._auth;
  }

  public get tokens(): TokenService {
    if (!this._tokens) {
      this._tokens = new TokenService(this);
      this.logger.info('Loaded tokens service');
    }
    return this._tokens;
  }

  public get crypto(): CryptoService {
    if (!this._crypto) {
      this._crypto = new CryptoService(this);
      this.logger.info('Loaded crypto service');
    }
    return this._crypto;
  }

  public get errors(): ErrorService {
    if (!this._errors) {
      this._errors = new ErrorService(this);
      this.logger.info('Loaded errors service');
    }
    return this._errors;
  }

  public get cache(): CacheService {
    if (!this._cache) {
      this._cache = new CacheService(this);
      this.logger.info('Loaded cache service');
    }
    return this._cache;
  }

  public get scheduler(): SchedulerService {
    if (!this._scheduler) {
      this._scheduler = new SchedulerService(this);
      this.logger.info('Loaded scheduler service');
    }
    return this._scheduler;
  }

  public get websocket(): WebsocketService {
    if (!this._websocket) {
      this._websocket = new WebsocketService(this);
      this.logger.info('Loaded websocket service');
    }
    return this._websocket;
  }
}
