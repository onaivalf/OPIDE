# FASE-07: Suporte a Múltiplas Linguagens (Templates)

## Data
2026-06-18

## Objetivo
Expandir as linguagens de programação suportadas pelo modo educacional, adicionando templates de código estruturados para Java, C++ e Go, além de uma interface de galeria de templates para os alunos iniciarem novos arquivos rapidamente.

## Alterações Técnicas
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/templates/edu/java/main.java` | NOVO | Template inicial de classe Main em Java |
| `src/templates/edu/cpp/main.cpp` | NOVO | Template inicial de programa em C++ |
| `src/templates/edu/go/main.go` | NOVO | Template inicial de programa em Go |
| `src-tauri/src/gamification.rs` | MOD | Atualização de `create_edu_project` para suportar as novas linguagens |
| `src/components/TemplateGallery.tsx` | NOVO | Painel galeria com cartões descritivos e botão de criação de templates |

## Decisões de Arquitetura
- **Facilidade de inicialização:** Para não sobrecarregar o aluno, os templates são injetados diretamente na raiz do workspace ativo como arquivos independentes (`Main.java`, `main.cpp`, `main.go`).
- **Autonomia de criação:** A galeria de templates funciona chamando o comando Tauri `create_edu_project` de forma assíncrona, atualizando a visualização de arquivos na sidebar logo após a injeção do arquivo.
