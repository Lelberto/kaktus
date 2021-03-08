import { Model, Mongoose } from 'mongoose';
import createUserModel, { UserInstance } from '../models/user-model';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Database service class.
 * 
 * This service is used to interact with database(s). Models must be registered in this service.
 */
export default class DatabaseService extends Service {

  public readonly users: Model<UserInstance>;
  private readonly mongoose: Mongoose;

  /**
   * Creates a new database service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
    this.mongoose = this.createMongoose();
    this.users = createUserModel(container, this.mongoose);
  }

  /**
   * Connects to a database.
   * 
   * @param url URL (example : `mongodb://database.com:27017/collection`)
   * @async
   */
  public async connect(url: string): Promise<void> {
    await this.mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

  /**
   * Disconnects from a database.
   * 
   * @async
   */
  public async disconnect(): Promise<void> {
    await this.mongoose.disconnect();
  }

  /**
   * Creates Mongoose instance.
   * 
   * @returns Mongoose instance
   */
  private createMongoose(): Mongoose {
    const mongoose = new Mongoose();
    mongoose.set('useCreateIndex', true);
    return mongoose;
  }
}
