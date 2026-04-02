import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  features: {
    experimentalRSC: true,
  },
  webpackFinal: async (config) => {
    config.resolve = config.resolve || {};
    const srcDir = path.resolve(__dirname, '../src');
    config.resolve.alias = {
      ...config.resolve.alias,
      // Mock server-side modules so Storybook can render components
      // that transitively import them via server actions.
      // Use both alias forms since @storybook/nextjs may resolve @/ before or after webpackFinal.
      '@/lib/prisma': path.resolve(__dirname, 'mocks/prisma.ts'),
      '@/lib/actions': path.resolve(__dirname, 'mocks/actions.ts'),
      [path.resolve(srcDir, 'lib/prisma')]: path.resolve(__dirname, 'mocks/prisma.ts'),
      [path.resolve(srcDir, 'lib/actions')]: path.resolve(__dirname, 'mocks/actions.ts'),
    };
    return config;
  },
};

export default config;
