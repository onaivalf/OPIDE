# OPIDE v2 - Documentação de Arquitetura

## Visão Geral
OPIDE v2 é uma IDE baseada em web technologies utilizando Tauri, React, TypeScript e Monaco Editor.

## Estrutura do Projeto
- `src/`: Código fonte frontend (React/TypeScript)
- `src-tauri/`: Código fonte backend (Rust/Tauri)
- `docs/`: Documentação do projeto
- `public/`: Arquivos estáticos

## Tecnologias Principais
- **Frontend**: React, TypeScript, Vite
- **Backend**: Rust, Tauri
- **Editor**: Monaco Editor (@codingame/monaco-vscode-api)
- **Build**: Vite, Rollup

## Diretrizes de Desenvolvimento
- Seguir especificações do arquivo OPIDEv2.md na raiz
- Implementar feature flags para funcionalidades experimentais
- Manter compatibilidade com SharedArrayBuffer (COOP/COEP headers)
