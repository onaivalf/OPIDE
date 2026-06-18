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

## 2026-06-18 — FASE-01: UI Simplification - Edu Mode (CONCLUÍDA)

### Componentes React
- [ADD] `src/components/EduToggle.tsx` — Toggle para alternar entre Edu/Pro mode
- [ADD] `src/components/EduSidebar.tsx` — Sidebar simplificada para modo educacional
- [ADD] `src/components/EduActionBar.tsx` — Action bar com botões essenciais
- [ADD] `src/components/onboarding/Onboarding.tsx` — Wizard de 4 passos para novos usuários
- [ADD] `src/components/onboarding/Onboarding.css` — Estilização com animações

### Templates Educacionais
- [ADD] `src/templates/edu/python/` — Template Python com exercícios guiados
  - `exemplo_iniciante.py`: Função documentada com TODOs
  - `template.json`: Configuração com 2 exercícios progressivos
- [ADD] `src/templates/edu/javascript/` — Template JavaScript
  - `exemplo_iniciante.js`: Função com JSDoc e exercícios
  - `index.html`: Template HTML básico
  - `template.json`: Configuração com testes
- [ADD] `src/templates/edu/rust/` — Template Rust
  - `exemplo_iniciante.rs`: Função com documentação e testes unitários
  - `Cargo.toml`: Configuração do projeto
  - `template.json`: Template com linting Clippy

### Backend Rust
- [MOD] `src-tauri/src/lib.rs` — Integração de feature flags do Edu Mode
- [ADD] Suporte a comandos de template educacional

### Estilização
- [MOD] `src/styles/global.css` — Adicionado suporte a variáveis CSS para Edu Mode
- [ADD] Classes utilitárias para esconder/mostrar elementos por modo

### Documentação
- [ADD] `Docs/FASE-01-UI-Simplification.md` — Especificação completa da fase
- [MOD] `Docs/CURRENT_PHASE` — Atualizado para FASE-01

### Métricas Alvo
| Métrica | Antes | Alvo |
|---------|-------|------|
| Complexidade UI iniciantes | Alta | Baixa |
| Tempo para primeiro código | 5-10 min | < 2 min |
| Confusão com features | 80% | < 30% |

## 2026-06-18 — FASE-02: Verificação Automática e Gamificação (CONCLUÍDA)

### Backend Rust (Exercise Verifier)
- [ADD] `src-tauri/src/exercise_verifier.rs` — Módulo completo de verificação
  - `ExerciseDefinition`: Estrutura para definir exercícios
  - `VerificationResult`: Resultado com sucesso/erros/dicas/pontuação
  - `ExerciseProgress`: Tracking de progresso do aluno
  - `Achievement`: Sistema de conquistas
- [ADD] Comandos Tauri:
  - `verify_exercise()`: Verifica código do aluno
  - `get_exercise_template()`: Retorna template do exercício
  - `save_progress()`: Salva progresso do aluno
  - `get_achievements()`: Lista conquistas desbloqueadas
- [MOD] `src-tauri/src/lib.rs` — Registro dos comandos de exercício

### Frontend React
- [ADD] `src/hooks/useExerciseVerifier.ts` — Hook para gerenciar verificação
  - `verifyCode()`: Aciona verificação no backend
  - `resetExercise()`: Reseta exercício para estado inicial
  - `requestHint()`: Solicita dica progressiva
  - `submitExercise()`: Submete exercício finalizado
- [ADD] `src/components/exercises/ExercisePanel.tsx` — Painel lateral de exercícios
  - Exibição de enunciado e requisitos
  - Botão de verificar com feedback visual
  - Sistema de dicas progressivas
  - Barra de progresso do exercício
  - Animações de transição

### Gamificação
- [ADD] Sistema de conquistas:
  - "Primeiro Passo": Completar primeiro exercício
  - "Perseverança": Resolver após 3+ tentativas
  - "Mestre do Código": Completar sem erros
  - "Explorador": Tentar todos os templates
- [ADD] Sistema de pontuação:
  - Base: 100 pontos por exercício
  - Bônus: Primeira tentativa (+50), Sem dicas (+30)
  - Penalidade: Dica (-10), Erro (-5)

### Templates Atualizados
- [MOD] `src/templates/edu/python/template.json` — Adicionados testes automáticos
- [MOD] `src/templates/edu/javascript/template.json` — Adicionados testes
- [MOD] `src/templates/edu/rust/template.json` — Adicionados testes com assert

### Documentação
- [ADD] `Docs/FASE-02-Exercise-Verification.md` — Documentação completa da fase
- [MOD] `Docs/README.md` — Índice atualizado
- [MOD] `Docs/CURRENT_PHASE` — Atualizado para FASE-02

### Métricas Alvo
| Métrica | Antes | Alvo |
|---------|-------|------|
| Feedback ao aluno | Manual/Sem | Imediato (<1s) |
| Engajamento | Baixo | Alto (gamificação) |
| Taxa de completude | 40% | >70% |
| Retenção de conceitos | 50% | >80% |

### Próximos Passos
- FASE-03: Integração Monaco Editor (highlights de erros, quick fixes)
- FASE-04: Leaderboard e modo colaborativo (pair programming)
- FASE-05: Export de progresso para professores (relatórios PDF/CSV)
- FASE-06: Novos templates (Java, C++, Go, TypeScript avançado)
