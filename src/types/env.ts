export interface Env {
  Variables: {
    user: {
      sub: number;
      email: string;
      exp: number;
      iat: number;
    };
  };
}
