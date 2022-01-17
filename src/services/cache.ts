import NodeCache from 'node-cache';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Cache service class.
 * 
 * This service is used to manage the API cache with store, retrieve, delete data and more.
 */
export default class CacheService extends Service {

  private readonly cache: NodeCache;

  /**
   * Creates a new cache service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
    this.cache = this.createCache();
    this.createEvents();
  }

  /**
   * Sets a key and it value.
   * 
   * @param key Key
   * @param value Value
   * @param ttl Custom key time to live (in seconds)
   */
  public set<T>(key: string, value: T, ttl?: number): void {
    this.cache.set<T>(key, value, ttl);
  }

  /**
   * Gets value from a key.
   * 
   * @param key Key
   * @returns Value, or `undefined` if no value exists
   */
  public get<T>(key: string): T {
    return this.cache.get<T>(key);
  }

  /**
   * Deletes a key and it value.
   * 
   * @param key Key to delete
   */
  public del(key: string): void {
    this.cache.del(key);
  }

  /**
   * Take a value from a key.
   * 
   * This method combines the `get(key)` and `del(key)` methods.
   * 
   * @param key Key
   * @returns Value, or `undefined` if no value exists
   */
  public take<T>(key: string): T {
    return this.take<T>(key);
  }

  /**
   * Checks if a key exists.
   * 
   * @param key Key to check
   */
  public has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Flushes the cache and clear all data.
   */
  public flush(): void {
    this.cache.flushAll();
  }

  /**
   * Returns the cache size.
   * 
   * @returns Cache size (in bytes)
   */
  public size(): number {
    const { ksize, vsize } = this.cache.getStats();
    return ksize + vsize;
  }

  /**
   * Creates the cache from `node-cache` module.
   * 
   * @returns Created cache
   */
  private createCache(): NodeCache {
    return new NodeCache({
      stdTTL: this.container.config.services.cache.ttl,
      checkperiod: this.container.config.services.cache.checkPeriod,
      useClones: this.container.config.services.cache.useClones
    });
  }

  /**
   * Creates the events cache.
   * 
   * Events will be logged in the cache logs.
   */
  private createEvents(): void {
    this.cache.on('set', (key: string, value) => {
      this.logger.info('Stored key', key, 'with value', value);
    });
    this.cache.on('del', (key: string, value) => {
      this.logger.info('Deleted key', key, 'with value', value);
    });
    this.cache.on('expired', (key: string, value) => {
      this.logger.info('Expired key', key, 'with value', value);
    });
    this.cache.on('flush', () => {
      this.logger.info('Cache flushed');
    });
  }
}
