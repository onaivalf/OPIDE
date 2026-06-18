import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        chat: path.resolve(__dirname, 'chat.html')
      },
      output: {
        manualChunks: {
          'opide-custom': ['@/custom'],
          'tauri-api': ['@tauri-apps/api'],
          'vscode-api': ['@codingame/monaco-vscode-api'],
          'vscode-editor': [
            '@codingame/monaco-vscode-editor-service',
            '@codingame/monaco-vscode-model-service'
          ],
          'vscode-services': [
            '@codingame/monaco-vscode-files-service',
            '@codingame/monaco-vscode-keybindings-service',
            '@codingame/monaco-vscode-languages-service',
            '@codingame/monaco-vscode-textmate-service',
            '@codingame/monaco-vscode-theme-service',
            '@codingame/monaco-vscode-extensions-service'
          ],
          'vscode-theme-defaults': ['@codingame/monaco-vscode-theme-defaults'],
          'vendor': ['react', 'react-dom']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: [
      '@codingame/monaco-vscode-api',
      '@codingame/monaco-vscode-editor-service',
      '@codingame/monaco-vscode-model-service',
      '@codingame/monaco-vscode-files-service',
      '@codingame/monaco-vscode-keybindings-service',
      '@codingame/monaco-vscode-languages-service',
      '@codingame/monaco-vscode-textmate-service',
      '@codingame/monaco-vscode-theme-service',
      '@codingame/monaco-vscode-extensions-service',
      '@codingame/monaco-vscode-theme-defaults'
    ]
  },
  resolve: {
    alias: {
      'path': 'rollup-plugin-node-polyfills/polyfills/path',
      'monaco-editor': '@codingame/monaco-vscode-editor-service',
      '@codingame/monaco-vscode-api': '@codingame/monaco-vscode-api'
    },
    dedupe: ['@codingame/monaco-vscode-api']
  },
  worker: {
    format: 'es'
  }
})
