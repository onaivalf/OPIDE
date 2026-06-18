# CHANGELOG OPIDE v2

## 2026-06-18 — FASE-00: Performance Crítica e Estrutura Base

### Adicionado
- [ADD] Estrutura completa de diretórios (docs/, src/, src-tauri/, public/)
- [ADD] Configuração Vite com chunking agressivo (vite.config.ts)
- [ADD] Feature flags em Rust (get_feature_flags, toggle_feature_flag)
- [ADD] Headers COOP/COEP para SharedArrayBuffer
- [ADD] UI básica para gerenciamento de feature flags
- [ADD] Documentação de arquitetura (docs/architecture/README.md)
- [ADD] Documentação da FASE-00 (docs/development/FASE-00.md)
- [ADD] README geral do projeto
- [ADD] Ícone do aplicativo (copiado de OPIDE_Branding)

### Modificado
- N/A (projeto criado do zero)

### Removido
- N/A (projeto criado do zero)

### Notas Técnicas
- Feature flags implementadas em Rust com comandos Tauri
- Chunking estratégico separa vendor, vscode-services, vscode-editor
- TypeScript configurado com aliases (@/, @tauri/*)
- React 18 com StrictMode ativado
- Tema dark como padrão (variáveis CSS customizadas)

---

## Próximas Fases Planejadas

### FASE-01: UI Simplification (Edu Mode)
- Criar componentes EduActionBar, EduSidebar, EduToggle
- Implementar sistema de temas EDU/PRO
- Gate em initializeDeferredFeatures baseado no modo

### FASE-02: Edu Mode Engine
- Implementar EduProfile no engine Rust
- Forçar Ollama como provider único em modo EDU
- Desativar features pesadas (Engram, MCP, Vault)

### FASE-03: Performance & Startup
- Refinar code splitting
- Lazy loading de Monaco services
- Ajustes de CSP para EDU mode

### FASE-04: Onboarding & Templates
- Wizard de onboarding (EduWizard.tsx)
- Templates: Olá Mundo, Calculadora, Turtle
- Guia do Professor
