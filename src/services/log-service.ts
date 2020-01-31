import dateFormat from 'dateformat';
import fs from 'fs';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Log service class.
 * 
 * This service is used to log any message to console and / or to specific log files.
 */
export default class LogService extends Service {

    /**
     * Creates a new log service.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        super(container);
    }

    /**
     * Logs a message.
     * 
     * @param msg Message to log
     * @param severity Log severity
     * @param options Log options
     * @async
     */
    public async log(msg: any, severity: LogSeverity = 'INFO', options: LogOptions = { type: 'logs' }): Promise<void> {
        const now = Date.now();
        const fullMsg = `[${dateFormat(now, this.container.config.services.log.dateFormat)} - ${severity}] ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`;
        console.log(fullMsg);
        await this.write(now, options, fullMsg);
    }

    /**
     * Logs an information message.
     * 
     * @param msg Message to log
     * @param options Log options
     * @async
     */
    public async info(msg: any, options: LogOptions = { type: 'logs' }): Promise<void> {
        await this.log(msg, 'INFO', options);
    }

    /**
     * Logs a warning message.
     * 
     * @param msg Message to log
     * @param options Log options
     * @async
     */
    public async warn(msg: any, options: LogOptions = { type: 'logs' }): Promise<void> {
        await this.log(msg, 'WARN', options);
    }

    /**
     * Logs an error message.
     * 
     * @param msg Message to log
     * @param options Log options
     * @async
     */
    public async error(msg: any, options: LogOptions = { type: 'logs' }): Promise<void> {
        await this.log(msg, 'ERROR', options);
    }

    /**
     * Logs a debug message.
     * 
     * @param msg Message to log
     * @param options Log options
     * @async
     */
    public async debug(msg: any, options: LogOptions = { type: 'logs' }): Promise<void> {
        await this.log(msg, 'DEBUG', options);
    }

    /**
     * Write a log message to the specified log file.
     * 
     * @param date Date
     * @param type Log type (to write to the desired file)
     * @param msg Log message
     * @async
     */
    private async write(date: number, options: LogOptions, msg: any): Promise<void> {
        // Creates the logs directory if not exists
        await new Promise((resolve, reject) => {
            if (!fs.existsSync('logs')) {
                fs.mkdir('logs', (err) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve();
                });
            }
        });

        // Write logs
        await new Promise((resolve, reject) => {
            fs.appendFile(`logs/${options.type != null ? options.type : 'logs'}_${dateFormat(date, 'yyyy-mm-dd')}.log`, `${msg}\n`, err => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }
}

/**
 * Log severity type.
 */
export type LogSeverity = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

/**
 * Log options interface.
 */
export interface LogOptions {
    type?: 'logs' | 'service-container' | 'endpoints';
}
