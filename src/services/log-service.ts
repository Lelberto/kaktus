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
     * Logs a message in the console and file.
     * 
     * @param msg Message to log
     * @param type Log type (to write to the desired file)
     * @param severity Log severity
     */
    public async log(msg: any, type: LogType = LogType.LOG, severity: LogSeverity = 'INFO'): Promise<void> {
        const now = Date.now();
        const fullMsg = `[${dateFormat(now, this.container.config.services.log.dateFormat)} - ${severity}] ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`;
        console.log(fullMsg);
        await this.write(now, type, fullMsg);
    }

    /**
     * Write a log message to the specified log file.
     * 
     * @param date Date
     * @param type Log type (to write to the desired file)
     * @param msg Log message
     */
    private async write(date: number, type: LogType, msg: any): Promise<void> {
        await new Promise((resolve, reject) => {
            fs.appendFile(`logs/${type}_${dateFormat(date, 'yyyy-mm-dd')}.log`, `${msg}\n`, err => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }
}

/**
 * Log type enum.
 */
export enum LogType {
    LOG = 'logs',
    ENDPOINTS = 'endpoints'
}

/**
 * Log severity type.
 */
export type LogSeverity = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
