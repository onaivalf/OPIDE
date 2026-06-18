# FASE-09: Modo Apresentador (Professor)

## Data
2026-06-18

## Objetivo
Criar ferramentas e controles visuais dedicados a professores para facilitar a exibição e explicação de trechos de código em salas de aula ou apresentações, fornecendo ajustes de zoom, cursor laser simulado e ferramentas de destaque.

## Alterações Técnicas
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/hooks/usePresenterMode.ts` | NOVO | Hook React gerenciando nível de zoom global, estado do ponteiro laser e modo destaque |
| `src/components/PresenterMode.tsx` | NOVO | Barra flutuante de ferramentas de apresentação no rodapé do editor |

## Decisões de Arquitetura
- **Acessibilidade instantânea:** O zoom dinâmico atua redimensionando a propriedade `fontSize` do elemento root (`document.documentElement`), garantindo que todos os textos e barras de ferramentas do editor escalem proporcionalmente para melhor visualização em projetores de baixa resolução.
- **Cursor Laser Simulado:** Aplicação de classe global CSS (`edu-laser-pointer`) alterando o comportamento visual do mouse em tempo real sem sobrecarga de renderização.
