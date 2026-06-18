# Guia do Professor - OPIDE Edu Mode

## 📚 Visão Geral

Este guia foi desenvolvido para educadores que desejam utilizar o **OPIDE Edu Mode** em suas aulas de programação.

---

## 🎯 O que é o OPIDE Edu Mode?

O **OPIDE Edu Mode** é uma versão simplificada do ambiente de desenvolvimento OPIDE, projetada especificamente para:

- ✅ **Iniciantes** em programação
- ✅ **Salas de aula** com alunos de diversas idades
- ✅ **Workshops** e cursos introdutórios
- ✅ **Autoaprendizado** guiado

### Principais Características

| Feature | Descrição |
|---------|-----------|
| **Interface Simplificada** | Apenas ferramentas essenciais visíveis |
| **Templates Prontos** | Projetos pré-configurados para começar rápido |
| **Exercícios Guiados** | Passo a passo com dicas progressivas |
| **Feedback Imediato** | Verificação automática de código |
| **IA Educacional** | Explicações em linguagem simples |

---

## 🚀 Primeiros Passos

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/onaivalf/OPIDE.git

# Instale as dependências
cd OPIDE
npm install

# Inicie o modo educacional
npm run tauri:dev -- --edu
```

### 2. Primeira Execução

Na primeira vez que um aluno abrir o OPIDE:

1. O **Wizard de Onboarding** será exibido automaticamente
2. O aluno escolhe seu primeiro projeto template
3. O ambiente já está configurado para uso imediato

---

## 📁 Templates Disponíveis

### 🐍 Olá Mundo (Python)
- **Dificuldade:** Iniciante absoluto
- **Conceitos:** print(), comentários, variáveis
- **Duração estimada:** 10-15 minutos
- **Objetivo:** Primeiro contato com programação

### 🧮 Calculadora (JavaScript)
- **Dificuldade:** Iniciante
- **Conceitos:** Funções, DOM, eventos, tipos de dados
- **Duração estimada:** 20-30 minutos
- **Objetivo:** Criar uma aplicação web interativa

### 🐢 Turtle Graphics (Python)
- **Dificuldade:** Iniciante
- **Conceitos:** Loops, coordenadas, geometria
- **Duração estimada:** 30-45 minutos
- **Objetivo:** Desenhar formas com código

---

## 🎓 Estrutura de uma Aula Típica

### Aula 1: Introdução à Programação (45 min)

| Tempo | Atividade |
|-------|-----------|
| 0-10 min | Apresentação do OPIDE e wizard de onboarding |
| 10-20 min | Template "Olá Mundo" - primeiros comandos |
| 20-35 min | Desafio: personalizar mensagens |
| 35-45 min | Compartilhamento dos resultados |

### Aula 2: Variáveis e Interação (45 min)

| Tempo | Atividade |
|-------|-----------|
| 0-5 min | Revisão da aula anterior |
| 5-25 min | Template "Calculadora" - funções e inputs |
| 25-40 min | Desafio: adicionar novas operações |
| 40-45 min | Discussão sobre aprendizados |

### Aula 3: Loops e Geometria (60 min)

| Tempo | Atividade |
|-------|-----------|
| 0-10 min | Introdução aos loops |
| 10-35 min | Template "Turtle Graphics" - desenhando formas |
| 35-50 min | Desafio criativo: desenhar algo original |
| 50-60 min | Galeria de projetos |

---

## 💡 Dicas Pedagógicas

### Para Alunos Muito Iniciantes

1. **Comece pelo visual:** Turtle Graphics engaja mais que código abstrato
2. **Celebre pequenas vitórias:** Cada exercício completado é progresso
3. **Use analogias:** Compare variáveis com "caixas", loops com "receitas"
4. **Erro é aprendizado:** Mostre que erros de sintaxe são normais

### Diferenciação por Nível

| Nível | Estratégia |
|-------|------------|
| **Iniciante** | Foque em 1-2 templates, repita exercícios |
| **Intermediário** | Adicione desafios extras nos templates |
| **Avançado** | Peça para criar variações dos templates |

### Gestão de Sala de Aula

- ✅ Projete sua tela enquanto explica
- ✅ Circule pela sala ajudando individualmente
- ✅ Use o sistema de conquistas para motivar
- ✅ Permita que alunos avançados ajudem colegas

---

## 🔧 Recursos do Professor

### Monitoramento de Progresso

O OPIDE salva automaticamente:
- ✅ Exercícios completados
- ✅ Conquistas desbloqueadas
- ✅ Tempo gasto em cada atividade

### Exportar Resultados

Em breve: função para exportar relatórios de progresso em PDF/CSV.

### Criar Templates Personalizados

Você pode criar seus próprios templates:

1. Copie a estrutura de um template existente
2. Modifique `template.json` com seus exercícios
3. Adicione na pasta `src/templates/edu/`

---

## 🏆 Sistema de Conquistas

As conquistas motivam os alunos a persistir:

| Conquista | Como Desbloquear |
|-----------|------------------|
| 🌟 **Primeiro Passo** | Completar primeiro exercício |
| 🌟 **Perseverança** | Tentar 3 vezes antes de pedir ajuda |
| 🌟 **Mestre do Código** | Completar todos exercícios de um template |
| 🌟 **Explorador** | Experimentar 3 templates diferentes |

---

## ❓ Perguntas Frequentes

### "Meu código não roda, e agora?"

1. Verifique mensagens de erro no terminal
2. Use o botão 🤖 **Explicar** para IA ajudar
3. Compare com a solução de exemplo no README

### "Terminei rápido, e agora?"

Sugira desafios extras:
- Mudar cores/estilos
- Adicionar novas funcionalidades
- Ajudar um colega

### "Não tenho experiência com programação, consigo usar?"

Sim! O OPIDE Edu foi feito para isso:
- Interface intuitiva
- Instruções em português claro
- IA disponível para dúvidas

---

## 📞 Suporte

- **Documentação Técnica:** `/workspace/OPIDE/Docs/`
- **Issues e Sugestões:** https://github.com/onaivalf/OPIDE/issues
- **Comunidade:** [Link para Discord/Forum]

---

## 🙏 Créditos

Desenvolvido com ❤️ para educação em programação.

Baseado na arquitetura OpenPawz/OPIDE.

Licença: MIT
