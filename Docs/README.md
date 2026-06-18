# OPIDE Performance & Edu-Mode Refactor — Documentação

> **Diretório central de documentação para todas as fases do refactor.**  
> Este diretório contém os registros técnicos, decisões de arquitetura e changelog.

## Estrutura

| Arquivo | Descrição |
|---------|-----------|
| `FASE-00-PERFORMANCE.md` | Performance Crítica — boot em 3 camadas |
| `FASE-01-UI-SIMPLIFICATION.md` | UI Simplification — modos EDU/PRO |
| `FASE-02-Exercise-Verification.md` | Verificação Automática e Gamificação |
| `FASE-03-PERFORMANCE.md` | Performance Refinements — code splitting |
| `FASE-04-ONBOARDING.md` | Onboarding & Templates — wizard e projetos |
| `CHANGELOG.md` | Registro acumulativo de todas as alterações |
| `GUIA-DO-PROFESSOR.md` | Guia completo para educadores |

## Protocolo de Atualização

1. Cada fase deve criar seu próprio arquivo `FASE-XX-NOME.md`
2. Todas as fases devem registrar alterações no `CHANGELOG.md`
3. Manter backups em `.trash/` quando necessário

## Início Rápido

```bash
# Verificar fase atual
cat CURRENT_PHASE 2>/dev/null || echo "FASE-00"

# Verificar status do build
cargo check --features lite && cargo check --features full
npm run build
```
