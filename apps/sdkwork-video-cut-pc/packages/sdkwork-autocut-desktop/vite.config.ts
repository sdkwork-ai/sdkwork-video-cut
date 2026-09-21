import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { createSdkworkCredentialEntryBootstrapVitePlugin } from '@sdkwork/iam-credential-entry/vite';

const appRoot = path.dirname(fileURLToPath(import.meta.url));

function createAutoCutManualChunk(id: string): string | undefined {
  if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react-router-dom/')) {
    return 'autocut-react';
  }

  if (id.includes('/node_modules/pixi.js/') || id.includes('/node_modules/@pixi/')) {
    return 'autocut-pixi';
  }

  if (id.includes('/node_modules/ai/') || id.includes('/node_modules/@ai-sdk/')) {
    return 'autocut-ai';
  }

  if (id.includes('/node_modules/@tauri-apps/api/')) {
    return 'autocut-tauri';
  }

  if (id.includes('/node_modules/lucide-react/')) {
    return 'autocut-icons';
  }

  const packageMatch = id.match(/[\\/]packages[\\/]sdkwork-autocut-([^\\/]+)[\\/]src[\\/]index\.ts$/u);
  if (packageMatch) {
    return `autocut-feature-${packageMatch[1]}`;
  }

  return undefined;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, appRoot, '');
  const bootstrapAccessToken = env.SDKWORK_ACCESS_TOKEN ?? process.env.SDKWORK_ACCESS_TOKEN;
  return {
        plugins: [
          // The bootstrap credential reaches the renderer only through the shared IAM
          // plugin (dev-server HTML injection as
          // `globalThis.__SDKWORK_CREDENTIAL_ENTRY_BOOTSTRAP_ACCESS_TOKEN__`).
          // `define['process.env.SDKWORK_ACCESS_TOKEN']` is NOT a valid handoff
          // (IAM_CREDENTIAL_ENTRY_SPEC.md section 4/5).
          createSdkworkCredentialEntryBootstrapVitePlugin({
            accessToken: bootstrapAccessToken,
            environment: resolveViteEnvironment(mode, process.env),
          }),
          react(), tailwindcss(),
        ],
    resolve: {
      alias: [
        {
          find: 'react/jsx-runtime',
          replacement: path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
        },
        {
          find: 'react/jsx-dev-runtime',
          replacement: path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
        },
        {
          find: 'react',
          replacement: path.resolve(__dirname, 'node_modules/react/index.js'),
        },
        {
          find: /^@sdkwork\/autocut-([^/]+)$/,
          replacement: path.resolve(__dirname, '../sdkwork-autocut-undefined'),
        },
      ],
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      chunkSizeWarningLimit: 650,
      rollupOptions: {
        output: {
          manualChunks: createAutoCutManualChunk,
        },
      },
    },
  };
});
