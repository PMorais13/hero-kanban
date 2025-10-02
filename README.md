# Hero Kanban

Hero Kanban transforma o fluxo de trabalho tradicional em uma jornada cooperativa com missões, recompensas e métricas claras. O objetivo é unir a hierarquia robusta de plataformas como Jira/Trello à motivação de jogos modernos, dando visibilidade para gestores e criando feedback positivo contínuo para os times.

## Visão do Produto

- **Hierarquia completa**: Feature → História → Subtask (Subtarefa/Subbug), permitindo rastreabilidade e comunicação clara do progresso.
- **Quadros configuráveis**: colunas com WIP, cores, ícones e transições controladas para impedir "pulos" indevidos.
- **Gamificação saudável**: XP compartilhado, missões semanais/diárias, badges e recompensas cosméticas liberadas coletivamente.
- **Métricas de fluxo**: Lead Time, Cycle Time, Throughput e Cumulative Flow Diagram fazem parte da narrativa da guilda.

## Arquitetura Front-end

- Projeto Angular 19 com **standalone components** e **signals** para estado local (`BoardState`).
- Organização por features em `src/app/features`, seguindo boas práticas do `AGENT.md`.
- **Feature Explorer** dedicado para navegar entre features e histórias. Reaproveita o `BoardState` para manter uma fonte única de dados.
- UI construída com componentes puros (`BoardPage`, `BoardColumn`, `BoardCard`) focados em acessibilidade e tipagem forte (`board.models.ts`).
- Fluxo gamificado demonstrado por dados mockados: níveis do time, progresso de XP e missões com feedback visual.

## Executando localmente

```bash
npm install
npm start
```

O servidor sobe em `http://localhost:4200/`. O layout é responsivo e suporta navegação por teclado.

## Testes

```bash
npm test -- --watch=false
```

Os testes validam a criação do shell principal, regras de transição/WIP do serviço `BoardState` e os view models agregados do `FeatureExplorerState`.

## Próximos passos sugeridos

1. Integrar API real para persistir features, histórias e métricas.
2. Adicionar drag-and-drop (Angular CDK) com animações e validações das transições configuráveis.
3. Expandir camada de métricas com gráficos em tempo real e alertas proativos.
4. Implementar sistema de recompensas/loja compartilhada para o time.
