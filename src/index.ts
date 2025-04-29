import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import 'dotenv/config';

const app = new Hono();

app.get('/', (c) => {
  const NAME = process.env.NAME as string;
  return c.text(NAME);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
