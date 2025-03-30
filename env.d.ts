declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
    IP_HASH_SALT: string;
  }
}