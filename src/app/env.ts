export interface Bindings {
  DB: D1Database;
  R2: R2Bucket;
  RESEND_API_KEY: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

export interface Variables {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    userId: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
