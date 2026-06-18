# FASE-06: Integração com LMS (Learning Management System)

## Data
2026-06-18

## Objetivo
Permitir a exportação de notas, progresso, nível e conquistas dos alunos para plataformas LMS (Moodle, Canvas) no formato CSV ou SCORM, além de relatórios de desempenho em HTML e texto.

## Alterações Técnicas
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src-tauri/src/lms_export.rs` | NOVO | Funções em Rust para estruturar dados SCORM/CSV e salvar em disco |
| `src-tauri/src/lib.rs` | MOD | Registro dos comandos Tauri de exportação de dados |
| `src/hooks/useLMSExport.ts` | NOVO | Hook React encapsulando as chamadas ao backend de exportação |
| `src/components/LMSExportPanel.tsx` | NOVO | Interface amigável para seleção de formato e status da exportação |

## Decisões de Arquitetura
- **Exportação Local:** Sem depender de servidores ou credenciais complexas, o OPIDE gera arquivos padrão diretamente na raiz do workspace do aluno, permitindo o upload manual simples nos ambientes do Moodle ou do Canvas.
- **SCORM Simples:** Geração transparente do arquivo `imsmanifest.xml` mapeando o progresso para conformidade com a especificação SCORM 1.2.
