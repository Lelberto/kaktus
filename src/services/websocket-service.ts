import { Server, Socket } from 'socket.io';
import DisconnectWebSocket from '../websockets/disconnect-websocket';
import Websocket from '../websockets/websocket';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Websocket service class.
 * 
 * This service is used to manage the websocket server.
 */
export default class WebsocketService extends Service {

  private srv: Server;
  private readonly websockets: Websocket[];

  /**
   * Creates a new websocket service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
    this.srv = null;
    this.websockets = [
      new DisconnectWebSocket(container)
    ];
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
      this.websockets.forEach(websocket => {
        websocket.createEvents(this.srv, socket);
        this.logger.info('Registered websocket', websocket.constructor.name);
      });
    });
  }
}
