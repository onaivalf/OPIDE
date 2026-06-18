# FASE-10: Aplicativo PWA (Progressive Web App)

## Data
2026-06-18

## Objetivo
Configurar os assets e registros necessários para transformar o frontend web do OPIDE Edu em um Progressive Web App (PWA), permitindo sua instalação no sistema operacional do usuário e fornecendo uma experiência offline básica.

## Alterações Técnicas
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `public/manifest.json` | NOVO | Manifesto PWA contendo nome, cores do tema e mapeamento de ícones |
| `src/pwa/sw-register.ts` | NOVO | Script de registro do Service Worker no ciclo de carregamento |
| `src/pwa/offline-page.html` | NOVO | Página estática fallback exibida quando a conexão é perdida e o recurso não está no cache |

## Decisões de Arquitetura
- **Facilidade de instalação:** Uso do manifesto padrão (`manifest.json`) configurado em modo `standalone` para que a IDE seja aberta sem as barras de navegação do browser tradicional, assemelhando-se a um aplicativo nativo.
- **Cache Resiliente:** Registro dinâmico do service worker (`sw-register.ts`) anexado ao hook de inicialização do frontend.
