# OPIDE v2 - README

## Visão Geral
OPIDE v2 é uma IDE moderna baseada em tecnologias web, utilizando:
- **Tauri** para o backend e empacotamento
- **React + TypeScript** para o frontend
- **Monaco Editor** (@codingame/monaco-vscode-api) como editor de código
- **Vite** como build tool

## Estrutura do Projeto
```
OPIDEv2/
├── docs/              # Documentação
│   ├── architecture/  # Arquitetura do sistema
│   ├── components/    # Documentação de componentes
│   ├── api/           # Documentação da API
│   └── development/   # Guias de desenvolvimento
├── src/               # Código fonte frontend
│   ├── components/    # Componentes React
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utilitários
│   └── assets/        # Arquivos estáticos
├── src-tauri/         # Código fonte backend (Rust)
│   ├── src/           # Código Rust
│   └── icons/         # Ícones do aplicativo
├── public/            # Arquivos públicos
├── index.html         # HTML principal
├── package.json       # Dependências Node.js
├── tsconfig.json      # Configuração TypeScript
├── vite.config.ts     # Configuração Vite
└── OPIDEv2.md         # Especificação principal
```

## Pré-requisitos
- Node.js 18+
- Rust 1.70+
- Tauri CLI (`cargo install tauri-cli`)

## Instalação
```bash
# Instalar dependências
npm install

# Instalar dependências Rust
cd src-tauri && cargo build

# Voltar ao diretório raiz
cd ..
```

## Desenvolvimento
```bash
# Rodar em modo de desenvolvimento
npm run tauri dev

# Ou apenas o frontend
npm run dev
```

## Build
```bash
# Build de produção
npm run tauri build
```

## Feature Flags
O projeto utiliza um sistema de feature flags implementado em Rust para controlar funcionalidades experimentais:
- `experimental_editor`: Recursos experimentais do editor
- `ai_assistant`: Assistente de IA
- `multi_cursor_enhanced`: Melhorias no multi-cursores

As flags podem ser alternadas via interface ou comandos Tauri.

## Headers COOP/COEP
Para suporte a `SharedArrayBuffer` (necessário para alguns recursos do Monaco Editor), o projeto configura:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

Estes headers estão configurados no `vite.config.ts` e no `index.html`.

## Licença
MIT
