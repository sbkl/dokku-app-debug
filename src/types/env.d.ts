declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    REDIS_URL: string;
    PORT: string;
    CORS_ORIGIN: string;
    SESSION_COOKIE_SECRET: string;
    CLOUDINARY_KEY: string;
    CLOUDINARY_SECRET: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_FOLDER: string;
  }
}