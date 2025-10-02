# Sprints Feature

## Objetivo
Disponibilizar uma visão consolidada das sprints planejadas, com objetivos, foco estratégico e todas as histórias/tarefas que
as compõem. A página funciona como um hub de alinhamento antes de plannings ou reviews.

## Decisões técnicas
- Reutilização do `BoardState` para garantir fonte única de verdade das histórias e do vínculo com sprints (`sprintOverviews`).
- ViewModels prontos para consumo (`SprintOverviewViewModel`) evitam lógica no template e mantêm forte tipagem.
- Layout responsivo com foco em leitura rápida: cards destacam objetivo, período e status das histórias.
- Itens de checklist usam sinalização visual e texto escondido (`visually-hidden`) para reforçar acessibilidade.

## Uso
```ts
import { SPRINTS_ROUTES } from '@features/sprints/sprints.routes';
```
As rotas lazy-loaded expõem `SprintsPageComponent`, que pode ser linkado pelo menu lateral (`/sprints`).

## Checklist de manutenção
- [ ] Sincronizar dados de sprint com a fonte oficial quando a API estiver disponível.
- [ ] Validar contraste de cores das badges de status ao criar novos estados.
- [ ] Incluir métricas adicionais (capacidade planejada, velocidade) conforme necessidade do time.
