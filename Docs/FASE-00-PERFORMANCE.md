# FASE-00: Performance Crítica

## Data: 2026-06-18

## Objetivo
Reduzir boot em 70% e eliminar travamentos pós-boot através da implementação do sistema de "Boot em 3 Camadas", feature flags Rust, e otimizações de carregamento lazy.

## Alterações Técnicas

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `Cargo.toml` (workspace) | MOD | Adiciona workspace.metadata.features com lite/full |
| `crates/opide-engine/Cargo.toml` | MOD | Feature flags: engram, mcp, vault, dream, ast-index |
| `crates/opide-ai/Cargo.toml` | MOD | Feature flags: ast-index, embeddings |
| `crates/opide-shell/Cargo.toml` | MOD | Feature flags: git, lsp, dap |
| `src-tauri/Cargo.toml` | MOD | profile.dev com opt-level=1 para compilação rápida |
| `src-tauri/tauri.conf.json` | MOD | Corrige updater pubkey (remove placeholder) |
| `vite.config.ts` | PEND | Chunking agressivo (manualChunks por família) |
| `src/workbench.ts` | PEND | initializeWorkbenchLite() + loadDeferredServicesLazy() |
| `src/main.ts` | PEND | Chamar initializeWorkbenchLite() em vez de full |
| `crates/opide-engine/src/engine/engram/` | PEND | init_engram_lazy() com delay 30s |
| `src/opide/memory-palace/` | PEND | Virtualização com IntersectionObserver |
| `src/opide/opide-completions.ts` | PEND | Debounce 300ms + cancelamento |
| `src/opide/opide-activity-feed.ts` | PEND | Batch updates 200ms |
| `Docs/CHANGELOG.md` | ADD | Registro das alterações |

## Decisões de Arquitetura

### Por que feature flags em vez de remover código?
- Mantém compatibilidade com upstream OpenPawz
- Permite toggle runtime entre modos lite/full
- Facilita manutenção e merge de mudanças futuras

### Estratégia de Lazy Loading
1. **Camada 1 (< 1s)**: Apenas 5 service overrides essenciais
2. **Camada 2 (1-5s)**: Serviços carregados via idle callback
3. **Camada 3 (sob demanda)**: Features pesadas só quando usadas

### Engram Lazy Init
- Delay de 30s após boot inicial
- Evita delay perceptível quando usuário abre Memory Palace pela primeira vez
- Consolidação e embeddings só ocorrem se necessário

## Testes Realizados

- [ ] Build: cargo check --features lite
- [ ] Build: cargo check --features full
- [ ] Frontend: npm run build
- [ ] Runtime: npm run tauri dev

## Métricas Alvo

| Métrica | Antes | Depois (Alvo) |
|---------|-------|---------------|
| Boot cold | 8-15s | 3-4s |
| Boot warm | 5-8s | 1-2s |
| Compilação Rust incremental | 30-60s | 5-10s |
| UI responsiva | 6-10s travado | < 1s |

## Próximos Passos
[FASE-01-UI-SIMPLIFICATION.md](./FASE-01-UI-SIMPLIFICATION.md)
