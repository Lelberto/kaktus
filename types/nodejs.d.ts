declare namespace NodeJS {

    export interface ProcessEnv {
        API_PORT: string;
        DB_HOST: string;
        DB_PORT: string;
        DB_NAME: string;
        HASH_SALT: string;
        ACCESS_TOKEN_KEY: string;
        ACCESS_TOKEN_EXPIRATION: string;
        REFRESH_TOKEN_KEY: string;
        REFRESH_TOKEN_EXPIRATION: string;
        AUTHORIZATION_CODE_EXPIRATION: string;
    }
}
