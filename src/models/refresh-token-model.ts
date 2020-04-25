import { Document, Model, Mongoose, Schema } from 'mongoose';
import ServiceContainer from '../services/service-container';
import Attributes from './model';
import { UserInstance } from './user-model';

/**
 * Refresh token attributes interface.
 */
export interface RefreshTokenAttributes extends Attributes {
    token: string;
    user: UserInstance;
}

/**
 * Refresh token instance interface.
 */
export interface RefreshTokenInstance extends RefreshTokenAttributes, Document {}

export default function createModel(container: ServiceContainer, mongoose: Mongoose): Model<RefreshTokenInstance> {
    return mongoose.model('RefreshToken', createRefreshTokenSchema(), 'refreshTokens');
}

/**
 * Creates the refresh token model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 */
function createRefreshTokenSchema() {
    const schema = new Schema({
        token: {
            type: Schema.Types.String,
            required: [true, 'Refresh token is required']
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required']
        }
    });
    return schema;
}
