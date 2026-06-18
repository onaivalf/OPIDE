# FASE-08: Assistente de IA Educacional

## Data
2026-06-18

## Objetivo
Integrar o assistente de inteligência artificial nativo do OPIDE para fornecer explicações didáticas e direcionadas para estudantes (tutoria socrática), orientando-os em vez de fornecer a resposta direta.

## Alterações Técnicas
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src-tauri/src/lib.rs` | MOD | Atualização do comando `edu_explain_code` para disparar eventos de explicação pedagógica |

## Decisões de Arquitetura
- **Tutor Socrático:** O assistente de IA é instruído a atuar como um professor prestativo, fornecendo dicas e explicações teóricas passo a passo em vez de escrever o código final para o aluno.
- **Integração por Eventos:** O Tauri emite o evento `opide-edu-explain` contendo o prompt do professor, acionando o chat integrado no frontend de forma limpa e contextualizada.
