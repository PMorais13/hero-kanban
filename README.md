# Hero Kanban

Hero Kanban transforma o fluxo de trabalho tradicional em uma jornada cooperativa com missões, recompensas e métricas claras. A meta é unir a hierarquia robusta de plataformas como Jira/Trello à motivação de jogos modernos, dando visibilidade para gestores e criando feedback positivo contínuo para os times.

## Stack e fundamentos

- **Angular 19 standalone** com signals, rotas lazy e tipagem forte em serviços de estado.
- **Angular Material** como design system base (toolbars, sidenav, cards, progress bar, selects, chips e ícones).
- **Arquitetura por features** (`src/app/features`) e camada `core` para estados compartilhados.
- Tokens de estilo globais em `styles.scss` com tema escuro customizado e integração com Material Design.

## Execução local

```bash
npm install
npm start
```

Aplicação disponível em `http://localhost:4200/`. O layout é responsivo e todas as rotas suportam navegação por teclado.

## Testes

```bash
npm test -- --watch=false
```

Os testes cobrem o shell principal e regras de negócio dos serviços de estado (`BoardState`, `HeroControlState`).

## Guia de arquitetura

### Organização

- `core/`: estado global do herói, gerenciamento de tema e serviços utilitários compartilhados.
- `features/`: cada domínio (quadro, sprints, perfil, etc.) expõe componentes standalone, rotas lazy e serviços próprios.
- Componentes e estados são tipados (`BoardColumnViewModel`, `Story`, `SprintOverviewViewModel`) para evitar `any`.

### Design system com Angular Material

- `AppComponent` utiliza `MatToolbar`, `MatSidenav`, `MatList`, `MatChips` e `MatProgressBar` para compor o shell gamificado.
- A página do quadro combina `MatCard`, `MatButton`, `MatChip`, `MatFormField` e `MatSelect` para organizar ações, filtros e métricas.
- Ícones vêm de `mat-icon` com a fonte Material Symbols pré-carregada em `index.html`.
- `styles.scss` importa o tema escuro base do Angular Material e complementa com tokens próprios do Hero Kanban.

## Visão das features

### Quadro Kanban (`/`)
- `BoardState` mantém colunas, histórias e filtros com signals e view models prontos para a UI.
- Drag-and-drop preparado via `BoardDragState`, respeitando limites de WIP e transições configuráveis.
- Botão **Nova história** abre o modal `CreateStoryModalComponent` que valida etapa, prioridade, XP e subtarefas antes de salvar.
- Métricas destacam XP acumulado, nível e throughput semanal diretamente no header.

### Personalização do quadro (`/quadro/personalizar`)
- Página `BoardCustomizerPageComponent` manipula `BoardConfigState`, permitindo ativar/pausar etapas, renomear títulos e subtítulos e escolher o ícone que representa cada fase.
- Etapas podem ser reordenadas para refletir o fluxo atual com comandos acessíveis (setas) e o resultado é persistido no `order` das colunas.
- Atualizações refletem imediatamente no quadro principal graças ao estado compartilhado.

### Feature Explorer (`/features`)
- `FeatureExplorerState` agrega dados do quadro e expõe view models para catálogo e detalhe de features.
- Signals e `computed` sincronizam cards e listas sem lógica adicional nos templates.
- Catálogo conta com botão **Nova feature** que abre modal validando tema, missão e recompensa antes de registrar no `BoardState`.

### Sprints (`/sprints`)
- Aproveita `BoardState.sprintOverviews` para listar objetivos, datas e status das histórias de cada sprint.
- Layout em cards destaca metas estratégicas e checklists acessíveis.

### Perfil do herói (`/perfil`)
- Consome `HeroControlState` para mostrar nível, conquistas e itens obtidos pela guilda.
- `ThemeState` habilita seleção dinâmica entre as paletas **Noite Estelar**, **Aurora Boreal**, **Aurora Matinal**, **Maré Celestial**, **Forja em Brasas** e **Neblina Quântica**, atualizando tokens de cor globais.
- Componentização standalone facilita futuras expansões como loja ou ranking.

## Próximos passos sugeridos

1. Integrar API real para persistir features, histórias e métricas.
2. Ativar drag-and-drop do Angular CDK com animações e validação das transições configuráveis.
3. Expandir camada de métricas com gráficos em tempo real e alertas proativos.
4. Implementar sistema de recompensas/loja compartilhada para o time.
