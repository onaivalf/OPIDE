import { defineConfig } from 'vite'
import path from 'path'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5180,
    headers: {
      // Required for SharedArrayBuffer (used by @codingame extension host worker)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  build: {
    target: 'esnext',
    // FASE-00: Chunking agressivo para reduzir bundle inicial
    rollupOptions: {
      // Two HTML entries: index.html boots the full workbench, chat.html
      // is the detached-chat window's slim entry that mounts only the
      // chat panel (no Monaco, no workbench).
      input: {
        main: resolve(__dirname, 'index.html'),
        chat: resolve(__dirname, 'chat.html'),
      },
      output: {
        // FASE-00: Manual chunks por família de serviços para lazy loading eficiente
        manualChunks: (id) => {
          // OPIDE custom modules — sempre separados
          if (id.includes('/src/opide/')) return 'opide-custom'
          
          // Tauri API — separado para carregamento early
          if (id.includes('@tauri-apps/')) return 'tauri-api'
          
          // Monaco core e API
          if (id.includes('@codingame/monaco-vscode-api')) return 'vscode-api'
          if (id.includes('@codingame/monaco-vscode-base-service-override')) return 'vscode-platform'
          
          // Editor services (editor, model, working-copy)
          if (id.includes('vscode-editor-service-override') || 
              id.includes('vscode-model-service-override') ||
              id.includes('vscode-working-copy-service-override')) {
            return 'vscode-editor'
          }
          
          // File system services
          if (id.includes('vscode-files-service-override') ||
              id.includes('vscode-explorer-service-override')) {
            return 'vscode-files'
          }
          
          // Extension services
          if (id.includes('vscode-extensions-service-override') ||
              id.includes('vscode-extension-gallery-service-override')) {
            return 'vscode-extensions'
          }
          
          // Language services (syntax, themes, snippets)
          if (id.includes('vscode-languages-service-override') ||
              id.includes('vscode-textmate-service-override') ||
              id.includes('vscode-theme-service-override') ||
              id.includes('vscode-snippets-service-override')) {
            return 'vscode-language'
          }
          
          // Terminal
          if (id.includes('vscode-terminal-service-override')) return 'vscode-terminal'
          
          // Debug + Testing
          if (id.includes('vscode-debug-service-override') ||
              id.includes('vscode-testing-service-override')) {
            return 'vscode-debug'
          }
          
          // Workbench shell (activity bar, sidebar, status bar)
          if (id.includes('vscode-workbench-service-override')) return 'vscode-workbench'
          
          // Config + preferences + keybindings
          if (id.includes('vscode-configuration-service-override') ||
              id.includes('vscode-preferences-service-override') ||
              id.includes('vscode-keybindings-service-override')) {
            return 'vscode-config'
          }
          
          // SCM (Git)
          if (id.includes('vscode-scm-service-override')) return 'vscode-scm'
          
          // Search
          if (id.includes('vscode-search-service-override')) return 'vscode-search'
          
          // Notifications + dialogs
          if (id.includes('vscode-notifications-service-override') ||
              id.includes('vscode-dialogs-service-override')) {
            return 'vscode-ui'
          }
          
          // Default extensions (grammars, etc.) — chunk grande mas lazy
          if (id.includes('@codingame/monaco-vscode-all-default-extensions')) {
            return 'vscode-extensions-bundle'
          }
          
          // Fallback: tudo que é @codingame vai para vendor-vscode
          if (id.includes('@codingame/')) return 'vendor-vscode'
          
          // node_modules genéricos para vendor
          if (id.includes('node_modules')) return 'vendor'
          
          // undefined = deixa rollup decidir (código do app principal)
        },
      },
    },
    // FASE-00: Split chunks para melhor cache
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Manter logs em dev
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    // FASE-00: Excluir TODOS @codingame do pre-bundling — eles usam dynamic imports
    exclude: [
      '@codingame/monaco-vscode-api',
      '@codingame/monaco-vscode-base-service-override',
      '@codingame/monaco-vscode-host-service-override',
      '@codingame/monaco-vscode-environment-service-override',
      '@codingame/monaco-vscode-log-service-override',
      '@codingame/monaco-vscode-lifecycle-service-override',
      '@codingame/monaco-vscode-remote-agent-service-override',
      '@codingame/monaco-vscode-files-service-override',
      '@codingame/monaco-vscode-model-service-override',
      '@codingame/monaco-vscode-working-copy-service-override',
      '@codingame/monaco-vscode-editor-service-override',
      '@codingame/monaco-vscode-extensions-service-override',
      '@codingame/monaco-vscode-extension-gallery-service-override',
      '@codingame/monaco-vscode-theme-service-override',
      '@codingame/monaco-vscode-textmate-service-override',
      '@codingame/monaco-vscode-languages-service-override',
      '@codingame/monaco-vscode-language-detection-worker-service-override',
      '@codingame/monaco-vscode-snippets-service-override',
      '@codingame/monaco-vscode-emmet-service-override',
      '@codingame/monaco-vscode-configuration-service-override',
      '@codingame/monaco-vscode-keybindings-service-override',
      '@codingame/monaco-vscode-preferences-service-override',
      '@codingame/monaco-vscode-markers-service-override',
      '@codingame/monaco-vscode-quickaccess-service-override',
      '@codingame/monaco-vscode-notifications-service-override',
      '@codingame/monaco-vscode-dialogs-service-override',
      '@codingame/monaco-vscode-output-service-override',
      '@codingame/monaco-vscode-accessibility-service-override',
      '@codingame/monaco-vscode-explorer-service-override',
      '@codingame/monaco-vscode-search-service-override',
      '@codingame/monaco-vscode-scm-service-override',
      '@codingame/monaco-vscode-outline-service-override',
      '@codingame/monaco-vscode-timeline-service-override',
      '@codingame/monaco-vscode-comments-service-override',
      '@codingame/monaco-vscode-terminal-service-override',
      '@codingame/monaco-vscode-storage-service-override',
      '@codingame/monaco-vscode-workspace-trust-service-override',
      '@codingame/monaco-vscode-secret-storage-service-override',
      '@codingame/monaco-vscode-authentication-service-override',
      '@codingame/monaco-vscode-user-data-sync-service-override',
      '@codingame/monaco-vscode-user-data-profile-service-override',
      '@codingame/monaco-vscode-edit-sessions-service-override',
      '@codingame/monaco-vscode-debug-service-override',
      '@codingame/monaco-vscode-testing-service-override',
      '@codingame/monaco-vscode-task-service-override',
      '@codingame/monaco-vscode-multi-diff-editor-service-override',
      '@codingame/monaco-vscode-performance-service-override',
      '@codingame/monaco-vscode-localization-service-override',
      '@codingame/monaco-vscode-telemetry-service-override',
      '@codingame/monaco-vscode-welcome-service-override',
      '@codingame/monaco-vscode-chat-service-override',
      '@codingame/monaco-vscode-notebook-service-override',
      '@codingame/monaco-vscode-interactive-service-override',
      '@codingame/monaco-vscode-speech-service-override',
      '@codingame/monaco-vscode-update-service-override',
      '@codingame/monaco-vscode-relauncher-service-override',
      '@codingame/monaco-vscode-workbench-service-override',
      '@codingame/monaco-vscode-view-common-service-override',
      '@codingame/monaco-vscode-all-default-extensions',
      '@codingame/monaco-vscode-theme-defaults-default-extension',
    ],
  },
  resolve: {
    alias: {
      path: 'path-browserify',
      'monaco-editor': '@codingame/monaco-vscode-api/monaco',
    },
    dedupe: ['@codingame/monaco-vscode-api'],
  },
  worker: {
    format: 'es',
  },
})
