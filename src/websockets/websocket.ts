import { Server, Socket } from 'socket.io';
import Component from '../component';
import ServiceContainer from '../services/service-container';

/**
 * Base websocket class.
 * 
 * Websockets are used to create events by groups, and are loaded every time a socket connects.
 * 
 * To create a websocket, simply extends this class and register it in the `WebsocketService`.
 */
export default abstract class Websocket extends Component {

  /**
   * Creates a new websocket.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
  }

  /**
   * Creates the websocket events.
   * 
   * @param srv Server socket
   * @param socket Client socket
   */
  public abstract createEvents(srv: Server, socket: Socket): void;
}
