import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['worker-configuration.d.ts', 'migrations/', '.wrangler/', 'node_modules/'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
);
