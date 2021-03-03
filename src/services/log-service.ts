import fs from 'fs';
import moment from 'moment';
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
   * It is recommended to use specific methods to log a message instead of this method :
   * - `info(...msg)` to log an information message
   * - `warn(...msg)` to log a warning message
   * - `error(...msg)` to log an error message
   * - `debug(...msg)` to log a debug message
   * 
   * @param severity Log severity
   * @param msg Message to log
   */
  public log(severity: LogSeverity = 'INFO', ...msg: unknown[]): void {
    const now = new Date();
    const dateFormat = moment(now).format(this.container.config.services.log.dateFormat);
    const datetimeFormat = moment(now).format(this.container.config.services.log.datetimeFormat);
    const prefix = `[${datetimeFormat} - ${severity}]`;
    switch (severity) {
      default:
        console.log(prefix, ...msg);
        break;
      case 'INFO':
        console.info(prefix, ...msg);
        break;
      case 'WARN':
        console.warn(prefix, ...msg);
        break;
      case 'ERROR':
        console.error(prefix, ...msg);
        break;
      case 'DEBUG':
        console.debug(prefix, ...msg);
        break;
    }
    this.write(dateFormat, prefix, ...msg);
  }

  /**
   * Logs an information message.
   * 
   * @param msg Message to log
   */
  public info(...msg: unknown[]): void {
    this.log('INFO', ...msg);
  }

  /**
   * Logs a warning message.
   * 
   * @param msg Message to log
   */
  public warn(...msg: unknown[]): void {
    this.log('WARN', ...msg);
  }

  /**
   * Logs an error message.
   * 
   * @param msg Message to log
   */
  public error(...msg: unknown[]): void {
    this.log('ERROR', ...msg);
  }

  /**
   * Logs a debug message.
   * 
   * @param msg Message to log
   */
  public debug(...msg: unknown[]): void {
    this.log('DEBUG', ...msg);
  }

  /**
   * Write a log message to the specified log file.
   * 
   * @param dateFormat Date format for the file name
   * @param msg Log message
   */
  private write(dateFormat: string, ...msg: unknown[]): void {
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    const fullMsg = msg.map(part => part instanceof Object ? `\n${JSON.stringify(part, null, this.container.config.services.log.jsonIndent)}` : part).join(' ');
    fs.appendFileSync(`logs/logs_${dateFormat}.log`, `${fullMsg}\n`);
  }
}

/**
 * Log severity.
 */
export type LogSeverity = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
