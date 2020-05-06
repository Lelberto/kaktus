import Service from './service';
import ServiceContainer from './service-container';

/**
 * Scheduler service class.
 * 
 * This service is used to start and stop schedulers tasks / timers.
 */
export default class SchedulerService extends Service {

    private tasks: Map<string, NodeJS.Timeout>;
    private timers: Map<string, NodeJS.Timeout>;

    /**
     * Creates a new scheduler service.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        super(container);
        this.tasks = new Map<string, NodeJS.Timeout>();
        this.timers = new Map<string, NodeJS.Timeout>();
    }

    /**
     * Runs a task with a time interval.
     * 
     * @param name Task name (used to stop the task)
     * @param fc Function to run
     * @param time Time interval in milliseconds
     * @param args Function arguments
     */
    public runTask(name: string, fc: () => void, time: number, ...args: any[]): void {
        this.tasks.set(name, setInterval(fc, time, args));
    }

    /**
     * Stops a task.
     * 
     * @param name Task name to stop
     */
    public stopTask(name: string): void {
        const task = this.tasks.get(name);
        if (task != null) {
            this.tasks.delete(name);
            clearInterval(task);
        }
    }

    /**
     * Runs a timer.
     * 
     * @param name Timer name (used to stop the timer)
     * @param fc Function to run
     * @param time Time to wait before run timer in milliseconds
     * @param args Function arguments
     */
    public runTimer(name: string, fc: () => void, time: number, ...args: any[]): void {
        this.timers.set(name, setTimeout(fc, time, args));
    }

    /**
     * Stops a timer.
     * 
     * @param name Timer name to stop
     */
    public stopTimer(name: string): void {
        const timer = this.timers.get(name);
        if (timer != null) {
            this.timers.delete(name);
            clearTimeout(timer);
        }
    }

    /**
     * Stops all running tasks.
     */
    public stopAllTasks(): void {
        for (const task of this.tasks) {
            clearInterval(task[1]);
        }
        this.tasks.clear();
    }

    /**
     * Stops all running timers.
     */
    public stopAllTimers(): void {
        for (const timer of this.timers) {
            clearInterval(timer[1]);
        }
        this.timers.clear();
    }
}
