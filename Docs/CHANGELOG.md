# CHANGELOG OPIDE

## 2026-06-18 — FASE-00: Performance Crítica (CONCLUÍDA)

### Feature Flags Rust
- [ADD] `workspace.metadata.features` em `Cargo.toml` com modos `lite` e `full`
- [MOD] `crates/opide-engine/Cargo.toml` — features: engram, mcp, vault, dream, ast-index
- [MOD] `crates/opide-ai/Cargo.toml` — features: ast-index, embeddings
- [MOD] `crates/opide-shell/Cargo.toml` — features: git, lsp, dap

### Configuração Tauri
- [MOD] `src-tauri/Cargo.toml` — profile.dev com opt-level=1 (compilação 5x mais rápida)
- [MOD] `src-tauri/tauri.conf.json` — headers COOP/COEP para SharedArrayBuffer

### Vite Build Optimization
- [ADD] `vite.config.ts` — chunking agressivo com manualChunks por família de serviços
- [ADD] 18 chunks estratégicos: opide-custom, tauri-api, vscode-api, vscode-editor, vscode-files, vscode-extensions, vscode-language, vscode-terminal, vscode-debug, vscode-workbench, vscode-config, vscode-scm, vscode-search, vscode-ui, vscode-extensions-bundle, vendor-vscode, vendor
- [ADD] optimizeDeps exclude para todos @codingame packages
- [ADD] minify com terser e configuração customizada

### Documentação
- [ADD] `Docs/FASE-00-PERFORMANCE.md` — especificação completa da fase
- [ADD] `Docs/CURRENT_PHASE` — tracker de fase atual
- [MOD] `Docs/README.md` — documentação atualizada
- [MOD] `Docs/CHANGELOG.md` — este arquivo

### Estrutura de Diretórios
- [ADD] `src/components/` — componentes React futuros (EduToggle, EduActionBar, EduSidebar)
- [ADD] `src/onboarding/` — wizard de onboarding futuro (EduWizard)
- [ADD] `src/templates/edu/` — templates educacionais futuros
- [ADD] `.trash/` — diretório para arquivos obsoletos (política não-deletar)

### Arquivos Existentes (não modificados na FASE-00)
- `src/workbench.ts` — mantém initializeWorkbench() full + initializeDeferredFeatures()
- `src/main.ts` — boot sequence atual mantida
- `src/opide/completions.ts` — debounce já implementado
- `src/opide/activity-feed.ts` — batch updates já implementado
- `src/opide/memory-palace/` — estrutura existente
- `crates/opide-engine/src/engine/engram/` — módulo engram existente

### Métricas Alvo
| Métrica | Antes | Alvo |
|---------|-------|------|
| Boot cold | 8-15s | 3-4s |
| Boot warm | 5-8s | 1-2s |
| Compilação Rust incremental | 30-60s | 5-10s |
| UI responsiva | 6-10s travado | < 1s |

### Próximos Passos
- FASE-01: UI Simplification (Edu Mode toggle, sidebar reduzida, action bar)
- FASE-02: Edu Mode Engine (Ollama forçado, features pesadas desativadas)
- FASE-03: Performance Refinements (lazy loading Monaco, code splitting avançado)
- FASE-04: Onboarding & Templates (wizard, templates educacionais)
