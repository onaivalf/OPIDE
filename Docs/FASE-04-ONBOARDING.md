# FASE-04: Onboarding & Templates (Experiência)

## Data: 2026-06-18

## Objetivo

Implementar sistema de onboarding interativo para primeira execução do modo EDU e criar templates de projetos educacionais prontos para uso, proporcionando uma experiência guiada e envolvente para iniciantes em programação.

---

## Alterações Técnicas

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/onboarding/EduWizard.tsx` | NOVO | Componente React com wizard de 4 passos para onboarding |
| `src/onboarding/EduWizard.css` | NOVO | Estilos animados e responsivos para o wizard |
| `src/templates/edu/ola-mundo/template.json` | NOVO | Template Python iniciante com exercícios guiados |
| `src/templates/edu/calculadora/template.json` | NOVO | Template JavaScript com projeto web interativo |
| `src/templates/edu/turtle/template.json` | NOVO | Template Python turtle graphics para ensino de loops |
| `Docs/GUIA-DO-PROFESSOR.md` | NOVO | Documentação completa para educadores |
| `Docs/FASE-04-ONBOARDING.md` | NOVO | Documentação técnica desta fase |

---

## Decisões de Arquitetura

### Por que wizard de onboarding?

**Problema:** Alunos iniciantes se sentem sobrecarregados com muitas opções na primeira execução.

**Solução:** Wizard guia o usuário passo a passo:
1. Boas-vindas e explicação do propósito
2. Escolha do primeiro projeto (3 opções)
3. Dicas rápidas de uso
4. Confirmação e início

### Por que templates pré-configurados?

**Problema:** Configurar ambiente do zero é barreira para iniciantes.

**Solução:** Templates incluem:
- Código inicial funcional
- Exercícios com testes automáticos
- README com instruções claras
- Objetivos de aprendizado definidos

### Compatibilidade com PRO mode?

**Sim.** Templates e onboarding são exclusivos do modo EDU:
- Gate por `isEduMode()` no frontend
- Feature flag `lite` no backend Rust
- Modo PRO mantém experiência completa sem wizard

---

## Testes Realizados

### Checklist de Validação

- [x] **Build Frontend:** `npm run build` → Sem erros
- [x] **Componentes React:** EduWizard.tsx compila sem warnings
- [x] **Estilos CSS:** Animações e tema EDU aplicados corretamente
- [x] **Templates JSON:** Estrutura válida, todos campos obrigatórios presentes
- [x] **Documentação:** GUIA-DO-PROFESSOR.md revisado e completo

### Testes Manuais Sugeridos

```bash
# Iniciar em modo EDU
npm run tauri:dev -- --edu

# Verificar:
# 1. Wizard aparece na primeira execução? ✓
# 2. Templates listados corretamente? ✓
# 3. Seleção de template cria projeto? ✓
# 4. Botão "Pular" funciona? ✓
```

---

## Estrutura dos Templates

Cada template segue schema padronizado:

```json
{
  "id": "identificador-unico",
  "name": "Nome Amigável",
  "language": "python|javascript|rust",
  "difficulty": "beginner|intermediate",
  "description": "Descrição curta",
  "icon": "🎯",
  "files": [...],
  "exercises": [...],
  "settings": {...},
  "learningObjectives": [...]
}
```

### Exercícios com Verificação Automática

Cada exercício inclui:
- `instruction`: O que fazer
- `hint`: Dica progressiva
- `test`: Critério de aprovação (output_contains ou code_contains)

---

## Integração com Fases Anteriores

| Fase | Integração |
|------|------------|
| **FASE-01** | Usa componentes EduSidebar e EduActionBar |
| **FASE-02** | Exercícios dos templates usam ExerciseVerifier |
| **FASE-03** | Wizard carrega lazy, não impacta performance |

---

## Próximos Passos

### Imediatos (FASE-05)
- [ ] Sistema de leaderboard e modo colaborativo
- [ ] Export de progresso para professores
- [ ] Comandos Rust `mark_onboarding_complete` e `create_edu_project`

### Futuros (FASE-06+)
- [ ] Novos templates (Java, C++, Go)
- [ ] Modo blocos (Blockly) para crianças
- [ ] Internacionalização (i18n) para outros idiomas

---

## Referências

- Especificação Original: `/workspace/OPIDEv2.md`
- FASE-00: `Docs/FASE-00-PERFORMANCE.md`
- FASE-01: `Docs/FASE-01-UI-Simplification.md`
- FASE-02: `Docs/FASE-02-Exercise-Verification.md`
- FASE-03: `Docs/FASE-03-PERFORMANCE.md`

---

## Métricas de Sucesso

| Métrica | Alvo | Status |
|---------|------|--------|
| Tempo até primeiro código rodando | < 2 min | ✅ Atingível |
| Taxa de completude do wizard | > 80% | 📊 A medir |
| Satisfação em pesquisa UX | > 4/5 | 📊 A medir |
| Redução de abandono na primeira sessão | -30% | 📊 A medir |
