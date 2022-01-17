import { Document, Model, Mongoose, Schema } from 'mongoose';
const mongooseToJson = require('@meanie/mongoose-to-json');
import ServiceContainer from '../services/service-container';
import Timestamps from './model';

/**
 * User attributes.
 */
export interface User extends Timestamps {
  email: string;
  name: string;
  password: string;
  refreshToken?: string;
}

/**
 * User document.
 */
export interface UserDocument extends User, Document {}

/**
 * User model.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserModel extends Model<UserDocument> {}

/**
 * Creates the user model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 */
export default function createModel(container: ServiceContainer, mongoose: Mongoose): UserModel {
  return mongoose.model<UserDocument, UserModel>('User', createUserSchema(container), 'users');
}

/**
 * Creates the user schema.
 * 
 * @param container Services container
 * @returns User schema
 */
function createUserSchema(container: ServiceContainer) {
  const schema = new Schema<UserDocument, UserModel>({
    email: {
      type: Schema.Types.String,
      required: [true, 'Email is required'],
      unique: true,
      validate: {
        validator: (email: string) => /\S+@\S+\.\S+/.test(email),
        message: 'Invalid email'
      }
    },
    name: {
      type: Schema.Types.String,
      required: [true, 'Name is required']
    },
    password: {
      type: Schema.Types.String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password is too small'],
      select: false
    },
    refreshToken: {
      type: Schema.Types.String,
      default: null,
      select: false
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  // Password hash validation
  schema.pre('save', async function (this: UserDocument, next) {
    if (this.password != null && (this.isNew || this.isModified('password'))) { // Validates the password only if filled
      try {
        this.password = await container.crypto.hash(this.password, parseInt(process.env.HASH_SALT, 10));
        return next();
      } catch (err) {
        return next(err as Error);
      }
    }
  });

  schema.plugin(mongooseToJson);

  return schema;
}
