// TODO Add doc comments
import { Document, Model, Mongoose, Schema } from 'mongoose';
import ServiceContainer from '../services/service-container';
import { ApplicationInstance } from './application-model';
import Attributes from './model';

export interface RefreshTokenAttributes extends Attributes {
    token: string;
    application: ApplicationInstance;
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
        application: {
            type: Schema.Types.ObjectId,
            ref: 'Application',
            required: [true, 'Application is required']
        }
    });
    return schema;
}
