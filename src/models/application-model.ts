import { Document, Mongoose, Schema } from 'mongoose';
import { GrantType } from '../services/oauth-service';
import ServiceContainer from '../services/service-container';
import Attributes from './model';
import { UserInstance } from './user-model';

/**
 * Application attributes interface.
 */
export interface ApplicationAttributes extends Attributes {
    secret: string;
    name: string;
    description: string;
    logo: string;
    author: UserInstance;
    grantTypes: GrantType[];
    redirectUris: string[];
    enabled: boolean;
}

/**
 * Application instance interface.
 */
export interface ApplicationInstance extends ApplicationAttributes, Document {}

/**
 * Creates the application model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 */
export default function createModel(container: ServiceContainer, mongoose: Mongoose) {
    return mongoose.model<ApplicationInstance>('Application', createApplicationSchema(container), 'applications');
}

/**
 * Creates the application schema.
 * 
 * @param container Services container
 */
function createApplicationSchema(container: ServiceContainer) {
    const schema = new Schema<ApplicationInstance>({
        secret: {
            type: Schema.Types.String,
            required: [true, 'Secret is required'],
            default: container.crypto.generateRandomString(50),
            select: false
        },
        name: {
            type: Schema.Types.String,
            required: [true, 'Name is required'],
            unique: true // TODO Unique errors are not "ValidationError", so returns a HTTP 500 if triggered
        },
        description: {
            type: Schema.Types.String,
            default: null
        },
        logo: {
            type: Schema.Types.String,
            default: null
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Author is required'],
            validate: {
                validator: async (authorId: string) => {
                    return await container.db.users.exists({ _id: authorId });
                },
                message: 'Invalid author'
            }
        },
        grantTypes: {
            type: [Schema.Types.String],
            required: [true, 'Grant types are required'],
            enum: ['authorization_code', 'password', 'client_credentials', 'refresh_token'],
            default: ['authorization_code', 'refresh_token']
        },
        redirectUris: {
            type: [Schema.Types.String],
            default: [],
            validate: {
                validator: async (uris: string[]) => {
                    for await (const uri of uris) {
                        if (!(/^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)$/m.test(uri))) {
                            return false;
                        }
                    }
                    return true;
                },
                message: 'Invalid redirect URIs'
            }
        },
        enabled: {
            type: Schema.Types.Boolean,
            default: true
        }
    });

    return schema;
}
