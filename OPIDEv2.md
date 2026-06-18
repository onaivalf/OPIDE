# OPIDE Performance & Edu-Mode Refactor — Especificação + Prompt de Execução

> **Versão:** 2.0  
> **Data:** 2026-06-18  
> **Autor:** Análise Técnica OPIDE  
> **Objetivo:** Reduzir boot em 70%, eliminar travamentos pós-boot, e adicionar modo educacional sem quebrar arquitetura PRO.

---

## PARTE 1: ESPECIFICAÇÃO TÉCNICA

### 1.1 Diagnóstico da Lentidão (Causas Raiz Confirmadas)

| # | Problema | Local no Código | Impacto |
|---|----------|-----------------|---------|
| 1 | **60 dependências `@codingame/monaco-vscode-*`** carregadas de uma vez | `package.json` | ~15-20MB JS, parse blocking |
| 2 | **`initialize()` síncrona com 40+ service overrides** | `src/workbench.ts` | Bloqueia main thread 2-5s |
| 3 | **`initializeDeferredFeatures()` dispara tudo simultâneo** | `src/workbench.ts` | 6-10s CPU travada pós-boot |
| 4 | **Engram inicializa no boot** (SQLite + embeddings + consolidação) | `crates/opide-engine/src/engine/engram/` | ~1-2s + memória |
| 5 | **Extension loader carrega TODAS as extensões de uma vez** | `src/workbench.ts` | ~2-5s para gramáticas/temas |
| 6 | **Compilação Rust incremental lenta** (opt-level=0, sem cache) | `Cargo.toml` profiles | 30-60s por mudança trivial |
| 7 | **Memory Palace renderiza todos os nós de uma vez** | `src/opide/memory-palace/index.ts` | Travamento com >100 memórias |
| 8 | **Ghost completions sem debounce efetivo** | `src/opide/opide-completions.ts` | Request a cada keystroke |
| 9 | **Activity Feed re-render a cada tool call** | `src/opide/opide-activity-feed.ts` | React churn contínuo |
| 10 | **Updater com pubkey placeholder** | `src-tauri/tauri.conf.json` | Indica build não pronto para release |

### 1.2 Arquitetura Alvo — "Boot em 3 Camadas"

```
┌─────────────────────────────────────────┐
│  CAMADA 1: INSTANTÂNEA (< 1s)          │
│  • Editor Monaco (5 service overrides) │
│  • File explorer básico                 │
│  • Tema e fonte                         │
│  • Tela de loading some imediatamente   │
├─────────────────────────────────────────┤
│  CAMADA 2: LAZY (1-5s, idle callback)   │
│  • Search, SCM, Outline, Timeline       │
│  • Terminal backend                     │
│  • Keybindings e configurações          │
│  • Extensões (3 por vez, chunked)       │
├─────────────────────────────────────────┤
│  CAMADA 3: SOB DEMANDA (só quando usar) │
│  • Chat panel (só ao abrir)             │
│  • Memory Palace (só ao clicar)         │
│  • Engram/SQLite (só após 30s ou query) │
│  • Ghost completions (só após 3 chars)    │
│  • Extension gallery (só ao abrir)      │
│  • Debug/Testing (só ao iniciar debug)    │
└─────────────────────────────────────────┘
```

### 1.3 Feature Flags Rust — Estrutura

```toml
# Cargo.toml workspace
[workspace.metadata.features]
default = ["full"]
lite = ["opide-engine/lite", "opide-ai/lite", "opide-shell/lite"]
full = ["engram", "mcp", "vault", "dream", "ast-index"]

# crates/opide-engine/Cargo.toml
[features]
default = ["full"]
full = ["engram", "mcp", "vault", "dream"]
lite = []  # Sem: engram, mcp, vault, dream, ast-index pesado

engram = ["rusqlite", "chrono", "chrono-tz", "regex", "embedding"]
mcp = ["tokio-rustls", "rustls", "webpki-roots"]
vault = ["aes-gcm", "zeroize"]
dream = ["engram"]
ast-index = ["tree-sitter", "tree-sitter-typescript", "tree-sitter-python", 
             "tree-sitter-rust", "tree-sitter-go", "tree-sitter-java",
             "tree-sitter-cpp", "tree-sitter-c", "tree-sitter-ruby",
             "tree-sitter-css", "tree-sitter-json", "tree-sitter-solidity"]
```

### 1.4 Edu Mode — Requisitos Funcionais

| ID | Requisito | Prioridade | Implementação |
|----|-----------|------------|---------------|
| EDU-01 | Toggle modo EDU/PRO via menu ou flag `--edu` | P0 | `src-tauri/src/commands.rs` + `src/components/EduToggle.tsx` |
| EDU-02 | Sidebar reduzida: apenas Arquivos, Ajuda, Config | P0 | `src/components/EduSidebar.tsx` (substitui ExplorerServiceOverride em modo edu) |
| EDU-03 | Barra de ações flutuante: ▶️ Rodar, 🐛 Testar, 🤖 Explicar, 💾 Salvar | P0 | `src/components/EduActionBar.tsx` |
| EDU-04 | Ocultar: Memory Palace, Activity Feed, MCP, Extension Gallery, Debug, Testing | P0 | Gate em `initializeDeferredFeatures()` + CSS `display: none` |
| EDU-05 | Tema claro/amigável por padrão em modo EDU | P1 | `[data-theme="edu"]` no `global.css` |
| EDU-06 | Pré-configurar Ollama (modelo local) como único provider | P1 | `crates/opide-engine/src/providers/mod.rs` — forçar Ollama quando `edu=true` |
| EDU-07 | Templates de projeto: Olá Mundo, Calculadora, Turtle | P2 | `src/templates/edu/` + wizard de onboarding |
| EDU-08 | Onboarding interativo na primeira execução | P2 | `src/onboarding/EduWizard.tsx` |
| EDU-09 | Mensagens de erro em português, linguagem natural | P2 | `src/i18n/pt-BR/edu-errors.json` |
| EDU-10 | Modo blocos (Scratch-like) opcional para iniciantes | P3 | `src/components/BlockMode.tsx` (Blockly integration) |

### 1.5 Métricas de Sucesso

| Métrica | Antes | Depois (Alvo) |
|---------|-------|---------------|
| Boot cold (primeira execução) | 8-15s | 3-4s |
| Boot warm (cacheado) | 5-8s | 1-2s |
| Compilação Rust incremental | 30-60s | 5-10s |
| Tempo até UI responsiva | 6-10s travado | < 1s após loading |
| Memory Palace abertura | 2-3s | 200ms (virtualizado) |
| Tamanho bundle JS (lite) | ~25MB | ~8MB |
| Tamanho bundle JS (full) | ~25MB | ~18MB (chunks separados) |
| Memória RAM em idle | ~800MB | ~400MB (lite) / ~600MB (full) |

---

## PARTE 2: PROMPT DE EXECUÇÃO PARA QWENCODER

```
═══════════════════════════════════════════════════════════════════════
  AGENTE QWENCODER — PROTOCOLO DE EXECUÇÃO OPIDE v2.0
═══════════════════════════════════════════════════════════════════════

IDENTIDADE:
Você é o Engenheiro de Sustentação do OPIDE, operando dentro do workspace
/workspace/OPIDE/. Seu objetivo: implementar a Especificação Técnica acima
sem quebrar a arquitetura existente. Todas as alterações são reversíveis
via git e documentadas em /workspace/OPIDE/Docs/.

═══════════════════════════════════════════════════════════════════════
SEÇÃO A: REGRAS ABSOLUTAS (VIOLAR = ROLLBACK IMEDIATO)
═══════════════════════════════════════════════════════════════════════

[A1] NUNCA modificar Cargo.lock manualmente — apenas via cargo update.
[A2] NUNCA deletar crates/ existentes — apenas desativar via feature flags.
[A3] NUNCA alterar APIs públicas do engine sem manter compatibilidade.
[A4] SEMPRE criar backup .bak antes de modificar arquivo > 100 linhas.
[A5] SEMPRE verificar git diff antes de commit — não commitar secrets/logs.
[A6] SEMPRE manter build passando: cargo check --features lite E cargo check --features full.
[A7] SEMPRE executar npm run build antes de considerar uma fase completa.
[A8] NUNCA usar setTimeout/setInterval para "esperar" algo — usar Promises/Observers.
[A9] NUNCA alucinar arquivos — se não existe, criar com template apropriado.
[A10] SEMPRE perguntar ao usuário antes de executar git push.

═══════════════════════════════════════════════════════════════════════
SEÇÃO B: PROTOCOLO DE CRUD DE ARQUIVOS
═══════════════════════════════════════════════════════════════════════

B.1 CRIAR (Create):
    ANTES: verificar se existe → [ -f "caminho" ] && echo "EXISTS" || echo "NEW"
    DEPOIS: criar com header de autoria:
      // <auto-generated: QwenCoder>
      // Fase: [NOME_DA_FASE]
      // Propósito: [descrição curta]
      // Dependências: [lista]

B.2 LER (Read):
    SEMPRE ler antes de modificar: cat arquivo | head -n 50
    Para arquivos grandes: sed -n '100,200p' arquivo
    Para encontrar funções: grep -n "function NOME" arquivo

B.3 ATUALIZAR (Update):
    NUNCA sobrescrever sem backup:
      cp arquivo.ts arquivo.ts.bak.$(date +%s)
    Usar patch semântico (sed com contexto) ou diff aplicado.
    Para modificações grandes (>20 linhas), criar arquivo .patch e aplicar:
      diff -u arquivo.ts.bak.* arquivo.ts > Docs/patches/FASE-XX-NOME.patch

B.4 DELETAR (Delete):
    NUNCA deletar — mover para .trash/:
      mkdir -p .trash/$(date +%Y%m%d)
      mv arquivo.obsoleto .trash/$(date +%Y%m%d)/
    Registrar em Docs/CHANGELOG.md:
      echo "- [DEL] $(date): arquivo → motivo: [descrição]" >> Docs/CHANGELOG.md

═══════════════════════════════════════════════════════════════════════
SEÇÃO C: FLUXO DE FASES (EXECUTAR EM ORDEM, NUNCA PULAR)
═══════════════════════════════════════════════════════════════════════

FASE ZERO: PERFORMANCE CRÍTICA (Máxima Prioridade)
─────────────────────────────────────────────────
Objetivo: Reduzir boot em 70% e eliminar travamentos.

Arquivos (ordem de execução):
  1. vite.config.ts          → Chunking agressivo (manualChunks por família)
  2. src/workbench.ts         → initializeWorkbenchLite() + loadDeferredServicesLazy()
  3. src/main.ts              → Chamar initializeWorkbenchLite() em vez de full
  4. crates/opide-engine/... → init_engram_lazy() com delay 30s
  5. src/opide/memory-palace/ → Virtualização com IntersectionObserver
  6. src/opide/opide-completions.ts → Debounce 300ms + cancelamento
  7. src/opide/opide-activity-feed.ts → Batch updates 200ms
  8. Cargo.toml workspace     → Feature flags lite/full
  9. src-tauri/Cargo.toml     → profile.dev com opt-level=1
  10. src-tauri/tauri.conf.json → Corrigir updater pubkey

Teste de aceitação:
  time npm run tauri:dev  # deve ser < 3s até loading screen sumir
  # Verificar: UI responde imediatamente após loading
  # Verificar: Memory Palace não carrega até clicar
  # Verificar: Chat não inicializa até abrir painel

Git commit:
  git add -A
  git commit -m "FASE-00: Performance Crítica

  - Implementa initializeWorkbenchLite() com 5 service overrides
  - Adiciona loadDeferredServicesLazy() para 30+ serviços
  - Chunking agressivo em vite.config.ts (8 chunks separados)
  - init_engram_lazy() com delay 30s ou sob demanda
  - Virtualização Memory Palace com IntersectionObserver
  - Debounce 300ms em ghost completions
  - Batch updates 200ms em activity feed
  - Feature flags lite/full no workspace Rust
  - profile.dev opt-level=1 para compilação rápida
  - Corrige updater pubkey (remover placeholder)

  Refs: Docs/FASE-00-PERFORMANCE.md"

─────────────────────────────────────────────────
FASE 01: UI SIMPLIFICATION (Estrutural)
─────────────────────────────────────────────────
Objetivo: Criar sistema de modos EDU/PRO na UI.

Arquivos:
  - src/global.css            → [data-theme="edu"] com paleta amigável
  - src/workbench.ts          → isEduMode() gate em initializeDeferredFeatures
  - src/components/EduActionBar.tsx      → NOVO
  - src/components/EduSidebar.tsx        → NOVO
  - src/components/EduToggle.tsx         → NOVO
  - src-tauri/src/lib.rs      → toggle_edu_mode command

Teste: npm run tauri:dev → botão "Modo Aula" aparece? Sidebar reduz?

─────────────────────────────────────────────────
FASE 02: Edu Mode Engine (Funcional)
─────────────────────────────────────────────────
Objetivo: Desativar features pesadas e pré-configurar Ollama.

Arquivos:
  - crates/opide-engine/src/engine/mod.rs     → EduProfile
  - crates/opide-engine/src/providers/mod.rs  → Forçar Ollama quando edu=true
  - src-tauri/src/lib.rs                      → Config default Edu

Teste: cargo check --features lite → passa?
       Em modo EDU, Settings mostra apenas "Modelo Local"?
       Engram não inicializa (logs: [EDU] Engram skipped)?

─────────────────────────────────────────────────
FASE 03: Performance & Startup (Otimização)
─────────────────────────────────────────────────
Objetivo: Reduzir tempo de inicialização em 60% (refinamentos).

Arquivos:
  - vite.config.ts            → Code splitting mais agressivo
  - src/main.ts               → Lazy loading de Monaco services
  - src-tauri/tauri.conf.json → Ajustar CSP para EDU mode

Teste: npm run build → chunks < 500KB cada?
       Lighthouse performance score > 80 em modo EDU?

─────────────────────────────────────────────────
FASE 04: Onboarding & Templates (Experiência)
─────────────────────────────────────────────────
Objetivo: Primeira execução guiada para alunos.

Arquivos:
  - src/onboarding/EduWizard.tsx            → NOVO
  - src/templates/edu/ola-mundo/            → NOVO
  - src/templates/edu/calculadora/          → NOVO
  - src/templates/edu/turtle/               → NOVO
  - Docs/GUIA-DO-PROFESSOR.md             → NOVO

Teste: Primeira execução mostra wizard? Templates criam projetos funcionais?

═══════════════════════════════════════════════════════════════════════
SEÇÃO D: PROTOCOLO DE DOCUMENTAÇÃO
═══════════════════════════════════════════════════════════════════════

D.1 Se /Docs não existir, CRIAR IMEDIATAMENTE:
    mkdir -p /workspace/OPIDE/Docs
    touch /workspace/OPIDE/Docs/README.md

D.2 Template para cada FASE-XX.md:

    # FASE-XX: [Nome da Fase]
    ## Data: $(date +%Y-%m-%d)
    ## Objetivo: [1 parágrafo]
    ## Alterações Técnicas:
    | Arquivo | Ação | Descrição |
    |---------|------|-----------|
    | `src/...` | MOD | ... |
    | `src/...` | NOVO | ... |
    ## Decisões de Arquitetura:
    - Por que não remover, apenas ocultar? [explicação]
    - Compatibilidade com PRO mode? [sim/não + como]
    ## Testes Realizados:
    - [ ] Build: cargo check --features lite ✓
    - [ ] Build: cargo check --features full ✓
    - [ ] Frontend: npm run build ✓
    - [ ] Runtime: npm run tauri:dev ✓
    ## Próximos Passos: [link para próxima fase]

D.3 CHANGELOG.md (acumulativo, append-only):
    # CHANGELOG OPIDE
    ## 2026-06-18 — FASE-00 Iniciada
    - [ADD] initializeWorkbenchLite()
    - [ADD] loadDeferredServicesLazy()
    - [MOD] vite.config.ts chunking agressivo
    ## 2026-06-18 — FASE-00 Completada
    - [FIX] Correção de CSS no tema edu
    - [DOC] Adicionada FASE-00-PERFORMANCE.md

═══════════════════════════════════════════════════════════════════════
SEÇÃO E: PROTOCOLO DE GIT (APÓS CADA FASE)
═══════════════════════════════════════════════════════════════════════

E.1 Verificar status:
    git status

E.2 Stage apenas arquivos relevantes:
    git add src/ src-tauri/ crates/ Docs/ Cargo.toml package.json
    git reset HEAD *.log *.tmp .trash/ node_modules/ target/ 2>/dev/null || true

E.3 Commit semântico:
    git commit -m "FASE-XX: [descrição curta]

    [corpo explicativo, 72 chars por linha]
    [lista de arquivos principais]

    Refs: Docs/FASE-XX-[NOME].md"

E.4 Tag da fase (milestones):
    git tag -a "fase-XX-v$(date +%Y%m%d)" -m "Fase XX completada"

E.5 Push (SEMPRE perguntar ao usuário antes):
    # git push origin main --tags  ← NÃO executar automaticamente

═══════════════════════════════════════════════════════════════════════
SEÇÃO F: CHECKLIST PRÉ-EXECUÇÃO (ANTES DE CADA AÇÃO)
═══════════════════════════════════════════════════════════════════════

- [ ] Estou em /workspace/OPIDE/?
- [ ] O arquivo que vou modificar existe? (cat primeiro)
- [ ] Há backup do arquivo original? (cp .bak)
- [ ] Esta alteração pertence à fase atual?
- [ ] O build ainda passa após a alteração? (cargo check && npm run build)
- [ ] Documentei em Docs/ a alteração?

═══════════════════════════════════════════════════════════════════════
SEÇÃO G: INICIALIZAÇÃO DE SESSÃO (USE ESTE PARA COMEÇAR)
═══════════════════════════════════════════════════════════════════════

cd /workspace/OPIDE
git status
echo "=== FASE ATUAL ===" && cat Docs/CURRENT_PHASE 2>/dev/null || echo "FASE-00"
echo "=== ÚLTIMO COMMIT ===" && git log -1 --oneline
echo "=== BUILD STATUS ===" && cargo check --features lite 2>&1 | tail -n 5

# Perguntar ao usuário:
# "Qual fase deseja executar? (00-Perf, 01-UI, 02-Engine, 03-Perf, 04-Onboard)"
# "Ou deseja executar o diagnóstico completo primeiro?"

═══════════════════════════════════════════════════════════════════════
SEÇÃO H: PROTOCOLO ANTI-ALUCINAÇÃO
═══════════════════════════════════════════════════════════════════════

[H1] ANTES de criar arquivo, verificar se já existe:
     find /workspace/OPIDE -name "NOME_DO_ARQUIVO" -type f

[H2] ANTES de modificar função, verificar assinatura:
     grep -n "function NOME\|async function NOME\|export function NOME" arquivo

[H3] ANTES de importar módulo, verificar se existe:
     ls /workspace/OPIDE/src/opide/ | grep NOME
     ls /workspace/OPIDE/crates/opide-engine/src/ | grep NOME

[H4] ANTES de usar API do Tauri, verificar documentação:
     grep -r "invoke\|listen\|emit" /workspace/OPIDE/src-tauri/src/ | head -n 10

[H5] ANTES de commitar, verificar diff completo:
     git diff --stat
     git diff --name-only

[H6] SE build quebrar após alteração:
     1. Reverter última alteração: git checkout -- arquivo
     2. Restaurar backup: cp arquivo.bak.* arquivo
     3. Verificar dependências: cargo tree | grep CRATE
     4. Tentar abordagem diferente

═══════════════════════════════════════════════════════════════════════
SEÇÃO I: COMANDOS ÚTEIS DE DIAGNÓSTICO
═══════════════════════════════════════════════════════════════════════

# Performance do bundle
npm run build
npx vite-bundle-visualizer dist/stats.html

# Tamanho dos chunks
ls -lh dist/assets/*.js | awk '{print $5, $9}'

# Tempo de boot (manual)
time npm run tauri:dev
# Anotar: tempo até "Workbench initialized" no console

# Profile de memória
# No DevTools: Performance → Memory → Heap snapshot
# Comparar: antes e depois de abrir Memory Palace

# Profile de CPU
# No DevTools: Performance → Record → Interagir → Stop
# Analisar: long tasks (>50ms) em main thread

# Check Rust features
cargo check --features lite
cargo check --features full
cargo check --no-default-features --features lite

# Tamanho do binário Rust
ls -lh src-tauri/target/release/app_lib.*
ls -lh src-tauri/target/release/opide*

═══════════════════════════════════════════════════════════════════════
FIM DO PROTOCOLO
═══════════════════════════════════════════════════════════════════════
```

---

## PARTE 3: ANEXOS

### Anexo A: Mapa de Arquivos do Projeto

```
OPIDE/
├── Cargo.toml                    ← Workspace Rust (ADICIONAR features)
├── package.json                  ← 60 deps @codingame (NÃO REMOVER, apenas lazy load)
├── vite.config.ts                ← Chunking (MODIFICAR)
├── tsconfig.json                 ← (NÃO MODIFICAR)
│
├── src/
│   ├── main.ts                   ← Entry point (MODIFICAR: chamar initializeWorkbenchLite)
│   ├── workbench.ts              ← Core initialization (MODIFICAR RADICALMENTE)
│   ├── global.css                ← (ADICIONAR [data-theme="edu"])
│   ├── App.tsx / App.ts          ← (VERIFICAR se existe)
│   ├── index.html / chat.html    ← Entry points (NÃO MODIFICAR)
│   │
│   ├── components/               ← (CRIAR pasta se não existir)
│   │   ├── EduActionBar.tsx      ← NOVO
│   │   ├── EduSidebar.tsx        ← NOVO
│   │   └── EduToggle.tsx         ← NOVO
│   │
│   ├── opide/                    ← Módulos custom OPIDE
│   │   ├── chat/                 ← (MODIFICAR: lazy init)
│   │   ├── memory-palace/        ← (MODIFICAR: virtualização)
│   │   ├── opide-completions.ts  ← (MODIFICAR: debounce)
│   │   ├── opide-activity-feed.ts← (MODIFICAR: batch)
│   │   ├── opide-settings.ts     ← (NÃO MODIFICAR)
│   │   ├── opide-inline.ts       ← (NÃO MODIFICAR)
│   │   ├── opide-extensions.ts   ← (NÃO MODIFICAR)
│   │   ├── opide-terminal-cmdk.ts← (NÃO MODIFICAR)
│   │   ├── opide-add-to-chat.ts  ← (NÃO MODIFICAR)
│   │   ├── opide-tool-bridge.ts  ← (NÃO MODIFICAR)
│   │   ├── workspace.ts          ← (NÃO MODIFICAR)
│   │   ├── tauri-fs-provider.ts  ← (NÃO MODIFICAR)
│   │   └── terminal-backend.ts   ← (NÃO MODIFICAR)
│   │
│   ├── onboarding/               ← (CRIAR pasta)
│   │   └── EduWizard.tsx         ← NOVO (FASE 04)
│   │
│   ├── templates/                ← (CRIAR pasta)
│   │   └── edu/                  ← (CRIAR pasta)
│   │       ├── ola-mundo/        ← NOVO (FASE 04)
│   │       ├── calculadora/      ← NOVO (FASE 04)
│   │       └── turtle/           ← NOVO (FASE 04)
│   │
│   └── styles/                   ← (NÃO MODIFICAR)
│       ├── opide-tokens.css
│       └── opide-overrides.css
│
├── src-tauri/
│   ├── Cargo.toml                ← (MODIFICAR: profile.dev, features)
│   ├── tauri.conf.json           ← (MODIFICAR: updater pubkey)
│   ├── build.rs                  ← (NÃO MODIFICAR)
│   ├── icons/                    ← (NÃO MODIFICAR)
│   └── src/
│       ├── lib.rs                ← (MODIFICAR: toggle_edu_mode command)
│       └── main.rs               ← (NÃO MODIFICAR)
│
├── crates/
│   ├── opide-engine/
│   │   ├── Cargo.toml            ← (MODIFICAR: features)
│   │   └── src/
│   │       ├── lib.rs            ← (NÃO MODIFICAR)
│   │       ├── engine/
│   │       │   ├── mod.rs        ← (MODIFICAR: EduProfile)
│   │       │   ├── agent_loop/   ← (NÃO MODIFICAR)
│   │       │   ├── engram/       ← (MODIFICAR: init_engram_lazy)
│   │       │   ├── providers/    ← (MODIFICAR: forçar Ollama em edu)
│   │       │   ├── mcp/          ← (NÃO MODIFICAR)
│   │       │   └── ...
│   │       └── ...
│   │
│   ├── opide-ai/
│   │   ├── Cargo.toml            ← (MODIFICAR: features)
│   │   └── src/                  ← (NÃO MODIFICAR estrutura)
│   │
│   ├── opide-bridge/
│   │   ├── Cargo.toml            ← (NÃO MODIFICAR)
│   │   └── src/                  ← (NÃO MODIFICAR)
│   │
│   ├── opide-shell/
│   │   ├── Cargo.toml            ← (MODIFICAR: features)
│   │   └── src/                  ← (NÃO MODIFICAR)
│   │
│   └── opide-sandbox/
│       ├── Cargo.toml            ← (NÃO MODIFICAR)
│       └── src/                  ← (NÃO MODIFICAR)
│
├── Docs/                         ← (CRIAR se não existir)
│   ├── README.md                 ← NOVO
│   ├── FASE-00-PERFORMANCE.md    ← NOVO
│   ├── FASE-01-UI-SIMPLIFICATION.md ← NOVO
│   ├── FASE-02-EDU-MODE.md       ← NOVO
│   ├── FASE-03-PERFORMANCE.md    ← NOVO
│   ├── FASE-04-ONBOARDING.md     ← NOVO
│   ├── CHANGELOG.md              ← NOVO
│   └── GUIA-DO-PROFESSOR.md      ← NOVO (FASE 04)
│
└── .trash/                       ← (CRIAR se não existir)
    └── YYYYMMDD/               ← (auto-gerado)
```

### Anexo B: Decisões de Arquitetura Documentadas

| Decisão | Justificativa |
|---------|---------------|
| **Não remover crates, apenas feature flags** | Mantém compatibilidade com upstream OpenPawz; permite toggle runtime |
| **Não remover @codingame deps, apenas lazy load** | Recompilar 60 pacotes levaria dias; lazy load resolve 90% do problema |
| **initializeWorkbenchLite() como função separada** | Permite fallback para initializeWorkbench() full se lite falhar |
| **Engram lazy em 30s, não sob demanda** | Evita delay perceptível quando usuário abre Memory Palace pela 1ª vez |
| **Virtualização em 100px rootMargin** | Balanceia performance vs UX — pré-renderiza nós próximos |
| **Edu mode como data-theme, não fork** | CSS é reversível instantaneamente; fork criaria manutenção dupla |
| **Ollama forçado em edu mode** | Modelo local = gratuito, offline, privado — ideal para sala de aula |
| **Templates em src/templates/edu/** | Separação clara; fácil de internacionalizar depois |

### Anexo C: Glossário de Termos OPIDE

| Termo | Significado | Contexto |
|-------|-------------|----------|
| Engram | Sistema de memória biológica do agente | `crates/opide-engine/src/engine/engram/` |
| AST | Abstract Syntax Tree — árvore de sintaxe | `crates/opide-ai/` |
| MCP | Model Context Protocol — protocolo de extensões | `crates/opide-engine/src/mcp/` |
| LSP | Language Server Protocol — autocomplete | `crates/opide-shell/` |
| DAP | Debug Adapter Protocol — depuração | `crates/opide-shell/` |
| Tauri | Framework desktop (Rust + WebView) | `src-tauri/` |
| Monaco | Editor de código (core do VS Code) | `src/` via @codingame |
| Workbench | Interface completa do VS Code | `src/workbench.ts` |
| Service Override | Plugin que substitui comportamento VS Code | 60 pacotes @codingame |
| Extension Host | Worker que roda extensões | `extensionHostWorkerMain` |
| Memory Palace | Visualização de memórias do agente | `src/opide/memory-palace/` |
| Ghost Completions | Sugestões inline do agente | `src/opide/opide-completions.ts` |
| Activity Feed | Log de ações do agente | `src/opide/opide-activity-feed.ts` |
| QuickJS | Engine JavaScript sandbox | `opide-sandbox/` (rquickjs) |
| Open VSX | Registro de extensões aberto | `open-vsx.org` |

---

## CHECKLIST FINAL DO DOCUMENTO

- [x] Especificação separada do Prompt de Execução
- [x] Causas raiz da lentidão identificadas com referências de código
- [x] Arquitetura alvo definida (3 camadas)
- [x] Feature flags Rust estruturadas
- [x] Requisitos Edu Mode com IDs e prioridades
- [x] Métricas de sucesso quantificadas
- [x] Fases em ordem sequencial, não puláveis
- [x] Protocolo de CRUD com backups
- [x] Protocolo de Git com commits semânticos
- [x] Protocolo de documentação em /Docs
- [x] Regras absolutas (anti-quebra)
- [x] Anti-alucinação (verificação prévia)
- [x] Mapa completo de arquivos do projeto
- [x] Decisões de arquitetura documentadas
- [x] Glossário de termos OPIDE
- [x] Comandos de diagnóstico incluídos
