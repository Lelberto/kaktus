import Service from './service';
import ServiceContainer from './service-container';

/**
 * Error service class.
 * 
 * This service is used to manage API errors.
 */
export default class ErrorService extends Service {

    /**
     * Creates a new error service.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        super(container);
    }

    /**
     * Translates mongoose validation error to API errors format.
     * 
     * This method can returns multiple API errors with only one mongoose validation error.
     * 
     * @param err Mongoose validation error
     */
    public translateMongooseValidationErrors(err: any): APIError[] {
        const translatedErrors: APIError[] = [];
        for (const field of Object.keys(err.errors)) {
            const subError = err.errors[field];
            translatedErrors.push({
                error: 'validation_failed',
                error_description: subError.message
            });
        }
        return translatedErrors;
    }
}

/**
 * API error interface.
 */
export interface APIError {
    error: string;
    error_description: string;
    error_uri?: string;
}
