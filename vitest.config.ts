import { defineConfig } from 'vitest/config';
import { cloudflareTest, cloudflarePool } from '@cloudflare/vitest-pool-workers';

const workersOptions = {
  wrangler: { configPath: './wrangler.jsonc' },
};

export default defineConfig({
  plugins: [cloudflareTest(workersOptions)],
  test: {
    globals: true,
    pool: cloudflarePool(workersOptions),
  },
});
