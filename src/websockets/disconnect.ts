import { Server, Socket } from 'socket.io';
import ServiceContainer from '../services/service-container';
import Websocket from './websocket';

/**
 * Disconnect websocket class.
 * 
 * The disconnect websocket adds the `disconnect` event.
 */
export default class DisconnectWebSocket extends Websocket {

  /**
   * Creates a new disconnect websocket.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
  }

  public createEvents(srv: Server, socket: Socket): void {
    socket.on('disconnect', () => {
      socket.rooms.forEach(socket.leave);
      this.logger.info(`Websocket disconnected : ${socket.handshake.address}`);
    });
  }
}
