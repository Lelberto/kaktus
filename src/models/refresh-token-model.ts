// TODO Add doc comments
import { Document, Model, Mongoose, Schema } from 'mongoose';
import ServiceContainer from '../services/service-container';
import Attributes from './model';
import { UserInstance } from './user-model';

export interface RefreshTokenAttributes extends Attributes {
    token: string;
    user: UserInstance;
}

export interface RefreshTokenInstance extends RefreshTokenAttributes, Document {}

export default function createModel(container: ServiceContainer, mongoose: Mongoose): Model<RefreshTokenInstance> {
    return mongoose.model('RefreshToken', createRefreshTokenSchema(), 'refreshTokens');
}

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
