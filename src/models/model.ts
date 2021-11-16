import { Schema } from 'mongoose';

/**
 * Timestamps attributes.
 */
export default interface Timestamps {
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Adds the "expiration" attribute to delete models after the time has elapsed.
 * 
 * This function is a mongoose plugin.
 * 
 * @param schema Schema to apply the plugin
 * @param options Plugin options
 */
export function expirePlugin(schema: Schema, options: { expires: number }): void {
  schema.add({
    expiration: {
      type: Schema.Types.Date,
      default: new Date(),
      expires: options.expires
    }
  });
}
