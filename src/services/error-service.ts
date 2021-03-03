import { Error } from 'mongoose';
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
   * Formats errors to JSON response.
   * 
   * @param errors Errors to format
   * @returns Formatted errors response
   */
  public formatErrors(...errors: APIError[]): APIErrorResponse {
    return { errors };
  }

  /**
   * Formats an error to query string.
   * 
   * @param err Error to format
   * @returns Formatted error query string
   */
  public formatErrorQuery(err: APIError): string {
    const { error, error_description, error_uri } = err;
    let formatted = `error=${error}`;
    if (error_description != null) {
      formatted += `&error_description=${error_description}`;
    }
    if (error_uri != null) {
      formatted += `&error_uri=${error_uri}`;
    }
    return formatted;
  }

  /**
   * Formats the generic server error to JSON response.
   * 
   * @param errorUri Documentation URI error
   * @returns Formated generic server error
   */
  public formatServerError(errorUri?: string): APIErrorResponse {
    return this.formatErrors({
      error: 'server_error',
      error_description: 'Internal server error',
      error_uri: errorUri
    });
  }

  /**
   * Translates mongoose validation error to API errors format.
   * 
   * This method can returns multiple API errors with only one mongoose validation error.
   * 
   * @param validationError Mongoose validation error
   */
  public translateMongooseValidationError(validationError: Error.ValidationError): APIError[] {
    const translatedErrors: APIError[] = [];
    for (const field of Object.keys(validationError.errors)) {
      const subError = validationError.errors[field];
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
  error: ErrorCode;
  error_description?: string;
  error_uri?: string;
}

/**
 * API error response interface.
 */
export interface APIErrorResponse {
  errors: APIError[];
}

/**
 * Error code type.
 */
export type ErrorCode =
    'access_denied'
  | 'invalid_client'
  | 'invalid_grant'
  | 'invalid_request'
  | 'invalid_scope'
  | 'not_found'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'unauthorized_client'
  | 'unsupported_grant_type'
  | 'unsupported_response_type'
  | 'validation_failed';
