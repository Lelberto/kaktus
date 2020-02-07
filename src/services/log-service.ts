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
     */
    public log(msg: any, severity: LogSeverity = 'INFO', options: LogOptions = { type: 'logs' }): void {
        const now = Date.now();
        const fullMsg = `[${dateFormat(now, this.container.config.services.log.dateFormat)} - ${severity}] ${(typeof msg === 'object') ? JSON.stringify(msg) : msg}`;
        switch (severity) {
            default:
                console.log(fullMsg);
                break;
            case 'INFO':
                console.info(fullMsg);
                break;
            case 'WARN':
                console.warn(fullMsg);
                break;
            case 'ERROR':
                console.error(fullMsg);
                if (msg instanceof Error) {
                    console.error(msg);
                }
                break;
            case 'DEBUG':
                console.debug(fullMsg);
                break;
        }
        this.write(now, options, fullMsg);
    }

    /**
     * Logs an information message.
     * 
     * @param msg Message to log
     * @param options Log options
     */
    public info(msg: any, options: LogOptions = { type: 'logs' }): void {
        this.log(msg, 'INFO', options);
    }

    /**
     * Logs a warning message.
     * 
     * @param msg Message to log
     * @param options Log options
     */
    public warn(msg: any, options: LogOptions = { type: 'logs' }): void {
        this.log(msg, 'WARN', options);
    }

    /**
     * Logs an error message.
     * 
     * @param msg Message to log
     * @param options Log options
     */
    public error(msg: any, options: LogOptions = { type: 'logs' }): void {
        this.log(msg, 'ERROR', options);
    }

    /**
     * Logs a debug message.
     * 
     * @param msg Message to log
     * @param options Log options
     */
    public debug(msg: any, options: LogOptions = { type: 'logs' }): void {
        this.log(msg, 'DEBUG', options);
    }

    /**
     * Write a log message to the specified log file.
     * 
     * @param date Date
     * @param type Log type (to write to the desired file)
     * @param msg Log message
     */
    private write(date: number, options: LogOptions, msg: any): void {
        if (!fs.existsSync('logs')) {
            fs.mkdirSync('logs');
        }
        fs.appendFileSync(`logs/${options.type != null ? options.type : 'logs'}_${dateFormat(date, 'yyyy-mm-dd')}.log`, `${msg}\n`);
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
