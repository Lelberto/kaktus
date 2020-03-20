// TODO Add doc comments
import { Document, Model, Mongoose, Schema } from 'mongoose';
import { GrantType } from '../services/oauth-service';
import ServiceContainer from '../services/service-container';
import { ApplicationInstance } from './application-model';
import Attributes from './model';
import { UserInstance } from './user-model';

export interface RefreshTokenAttributes extends Attributes {
    token: string;
    grantType: GrantType;
    application: ApplicationInstance;
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
        grantType: {
            type: Schema.Types.String,
            enum: ['authorization_code', 'password', 'client_credentials', 'refresh_token'],
            required: [true, 'Grant type is required']
        },
        application: {
            type: Schema.Types.ObjectId,
            ref: 'Application',
            required: [true, 'Application is required']
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [
                function(this: RefreshTokenInstance) {
                    return this.grantType === 'authorization_code';
                },
                'User is required with the "authorization_code" grant type'
            ],
            default: null
        }
    });
    return schema;
}
