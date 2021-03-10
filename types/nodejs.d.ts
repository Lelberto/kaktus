declare namespace NodeJS {

  export interface ProcessEnv {
    PORT: string;
    WEBSOCKET_PORT: string;
    DB_URL: string;
    HASH_SALT: string;
    ACCESS_TOKEN_KEY: string;
    ACCESS_TOKEN_EXPIRATION: string;
    REFRESH_TOKEN_KEY: string;
    REFRESH_TOKEN_EXPIRATION: string;
  }
}
