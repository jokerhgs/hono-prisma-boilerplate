import { Hono } from "hono";
import type { Context, Next } from "hono";
import { betterAuth } from "better-auth";
import type { Auth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "../../app/db";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../app/resend";
import type { AppEnv } from "../../app/env";

let _auth: Auth | null = null;

export function getAuth(env: AppEnv["Bindings"]): Auth {
  if (!_auth) {
    const db = createDb(env.DB);

    _auth = betterAuth({
      database: drizzleAdapter(db, { provider: "sqlite" }),
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL,
      emailAndPassword: {
        enabled: true,
        async sendResetPassword({ user, url }) {
          await sendPasswordResetEmail(env.RESEND_API_KEY, user.email, url);
        },
      },
      emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        async sendVerificationEmail({ user, url }) {
          await sendVerificationEmail(env.RESEND_API_KEY, user.email, url);
        },
      },
    }) as unknown as Auth;
  }
  return _auth;
}

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const auth = getAuth(c.env);
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
}

const router = new Hono<AppEnv>();

router.all("*", async (c) => {
  const ba = getAuth(c.env);
  return ba.handler(c.req.raw);
});

export default router;
