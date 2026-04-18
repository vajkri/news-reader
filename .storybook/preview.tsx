import type { Preview, Decorator } from '@storybook/react';
import { useEffect } from 'react';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import '../src/app/globals.css';

/**
 * The app uses @media (prefers-color-scheme: dark) for theming.
 * This decorator overrides CSS custom properties on the preview root
 * to simulate dark mode in Storybook without changing the app's approach.
 */
const DARK_TOKENS: Record<string, string> = {
  '--background': '#09090b',
  '--foreground': '#fafafa',
  '--foreground-secondary': '#d4d4d8',
  '--muted': '#27272a',
  '--muted-foreground': '#a1a1aa',
  '--border': '#27272a',
  '--primary': '#fafafa',
  '--primary-foreground': '#18181b',
  '--secondary': '#27272a',
  '--accent': '#27272a',
  '--card': '#0f0f12',
  '--highlight': 'rgba(250, 204, 21, 0.18)',
  '--highlight-foreground': '#fef08a',
  '--destructive': '#f87171',
  '--debug-active': '#4ade80',
  '--debug-inactive': '#f87171',
  '--chat-user-bg': '#27272a',
  '--chat-user-fg': '#e4e4e7',
  '--badge-critical-bg': 'rgba(153, 27, 27, 0.3)',
  '--badge-critical-fg': '#fca5a5',
  '--badge-important-bg': 'rgba(146, 64, 14, 0.3)',
  '--badge-important-fg': '#fcd34d',
  '--badge-notable-bg': 'rgba(30, 64, 175, 0.3)',
  '--badge-notable-fg': '#93c5fd',
  '--badge-new-bg': 'rgba(22, 101, 52, 0.3)',
  '--badge-new-fg': '#4ade80',
};

const LIGHT_TOKENS: Record<string, string> = {
  '--background': '#ffffff',
  '--foreground': '#0f0f0f',
  '--foreground-secondary': '#3f3f46',
  '--muted': '#f4f4f5',
  '--muted-foreground': '#71717a',
  '--border': '#e4e4e7',
  '--primary': '#18181b',
  '--primary-foreground': '#fafafa',
  '--secondary': '#f4f4f5',
  '--accent': '#f4f4f5',
  '--card': '#ffffff',
  '--highlight': '#fef9c3',
  '--highlight-foreground': '#451a03',
  '--destructive': '#dc2626',
  '--debug-active': '#22c55e',
  '--debug-inactive': '#ef4444',
  '--chat-user-bg': '#e4e4e7',
  '--chat-user-fg': '#18181b',
  '--badge-critical-bg': '#fee2e2',
  '--badge-critical-fg': '#991b1b',
  '--badge-important-bg': '#fef3c7',
  '--badge-important-fg': '#92400e',
  '--badge-notable-bg': '#dbeafe',
  '--badge-notable-fg': '#1e40af',
  '--badge-new-bg': '#dcfce7',
  '--badge-new-fg': '#166534',
};

const withColorScheme: Decorator = (Story, context) => {
  const scheme = context.globals.colorScheme || 'light';
  useEffect(() => {
    const root = document.documentElement;
    const tokens = scheme === 'dark' ? DARK_TOKENS : LIGHT_TOKENS;
    for (const [key, value] of Object.entries(tokens)) {
      root.style.setProperty(key, value);
    }
    root.style.colorScheme = scheme;
    document.body.style.backgroundColor = tokens['--background'];
    return () => {
      for (const key of Object.keys(tokens)) {
        root.style.removeProperty(key);
      }
      root.style.colorScheme = '';
      document.body.style.backgroundColor = '';
    };
  }, [scheme]);
  return <Story />;
};

const preview: Preview = {
  globalTypes: {
    colorScheme: {
      description: 'Color scheme',
      toolbar: {
        title: 'Color Scheme',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    colorScheme: 'dark',
  },
  decorators: [withColorScheme],
  parameters: {
    viewport: {
      options: {
        ...INITIAL_VIEWPORTS,
        mobile375: {
          name: 'Mobile 375px',
          styles: { width: '375px', height: '812px' },
        },
      },
    },
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
  },
};

export default preview;
