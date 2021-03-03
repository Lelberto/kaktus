import { setInterval } from 'timers';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Scheduler service class.
 * 
 * This service is used to start and stop schedulers tasks / timers.
 */
export default class SchedulerService extends Service {

  private tasks: Map<string, NodeJS.Timeout>;

  /**
   * Creates a new scheduler service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
    this.tasks = new Map<string, NodeJS.Timeout>();
  }

  /**
   * Runs a task with a time interval.
   * 
   * @param name Task name (used to stop the task)
   * @param fc Function to run
   * @param time Time interval in milliseconds
   */
  public runTask(name: string, fc: (task?: Task) => void, time: number): void {
    this.tasks.set(name, setInterval(fc, time, new Task(this, name)));
  }

  /**
   * Stops a task.
   * 
   * You can also use `task.stop()` with the `task` parameter in the callback function.
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
   * @param fc Function to run
   * @param time Time to wait before run timer in milliseconds
   */
  public runTimer(fc: () => void, time: number): void {
    setTimeout(fc, time);
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
}

/**
 * Task class.
 * 
 * A task is the object given in the callback parameter function when calling `container.scheduler.runTask()`. 
 */
export class Task {

  public readonly name: string;
  private readonly service: SchedulerService;

  /**
   * Creates a new task.
   * 
   * @param service Scheduler service
   * @param name Task name
   */
  public constructor(service: SchedulerService, name: string) {
    this.service = service;
    this.name = name;
  }

  /**
   * Stops the task.
   */
  public stop(): void {
    this.service.stopTask(this.name);
  }
}
