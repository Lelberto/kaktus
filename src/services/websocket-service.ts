import { Server, Socket } from 'socket.io';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Websocket service class.
 * 
 * This service is used to manage the websocket server.
 */
export default class WebsocketService extends Service {

  private srv: Server;

  /**
   * Creates a new websocket service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
    this.srv = null;
  }

  /**
   * Starts the websocket server.
   * 
   * @param port Listening port
   */
  public start(port: number = 8000): void {
    if (!this.srv) {
      this.srv = new Server(port, {
          pingInterval: 60000,
          pingTimeout: 600000,
          cors: {
            origin: '*'
          }
      });
      this.createEvents();
    }
  }

  /**
   * Stops the websocket server.
   */
  public stop(): void {
    if (this.srv) {
      this.srv.close();
      this.srv = null;
    }
  }

  /**
   * Creates events.
   */
  private createEvents(): void {
    this.srv.on('connect', (socket: Socket) => {
      this.logger.info(`Websocket connected : ${socket.handshake.address}`);

      // When the socket disconnects
      socket.on('disconnect', () => {
          socket.rooms.forEach(socket.leave);
          this.logger.info(`Websocket disconnected : ${socket.handshake.address}`);
      });

      // Websocket logic here
    });
  }
}
