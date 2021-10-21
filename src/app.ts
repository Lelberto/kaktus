import ServiceContainer from './services/service-container';

const container = ServiceContainer.getInstance();
container.srv.start().then(() => container.logger.info('Server is running in', container.env.nodeEnv, 'mode')).catch(console.error);
