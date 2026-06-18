# FASE-05: Gamificação Educacional

## Data
2026-06-18

## Objetivo
Engajar estudantes no aprendizado de programação através de dinâmicas de gamificação baseadas em XP local, níveis e conquistas (badges), salvando o progresso de forma persistente.

## Alterações Técnicas
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src-tauri/src/gamification.rs` | NOVO | Backend Rust persistindo dados em JSON local com comandos Tauri |
| `src-tauri/src/lib.rs` | MOD | Registro de novos comandos de gamificação |
| `src/services/edu-progress.ts` | NOVO | Service client-side para invocar comandos Tauri e disparar eventos |
| `src/hooks/useGamification.ts` | NOVO | Hook React para gerenciar e observar mudanças de XP/nível |
| `src/components/EduProgressBar.tsx` | NOVO | UI de barra de progresso e nível do aluno |
| `src/components/EduAchievementToast.tsx` | NOVO | Notificações toast ao desbloquear conquistas |
| `src/components/Leaderboard.tsx` | NOVO | Painel/Modal de classificação local |
| `src/components/EduActionBar.tsx` | MOD | Atribuição de XP e badges ao executar ações |

## Decisões de Arquitetura
- **Persistência leve:** O progresso do usuário e a leaderboard são mantidos em arquivos JSON locais (`.opide_edu_progress.json` e `.opide_leaderboard.json`) para evitar a complexidade e peso de um banco de dados relacional.
- **Eventos Globais:** A atualização de XP e novos badges disparam custom events no DOM (`opide-xp-updated` e `opide-achievement-unlocked`) permitindo que múltiplos componentes reajam de forma assíncrona.
