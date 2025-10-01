# Board Feature

## Objetivo
Fornecer um quadro Kanban gamificado que represente a hierarquia Feature → História → Subtask e traduza o progresso em XP, missões e recompensas visuais. Esta página é o coração da experiência, onde squads acompanham status, limites de WIP e objetivos colaborativos.

## Decisões técnicas
- **Signals** em `BoardState` para manter estado reativo com baixo acoplamento.
- **ViewModels tipados** (`BoardColumnViewModel`, `BoardCardViewModel`) garantem que a UI receba dados prontos para renderização.
- **Componentes standalone** desacoplados (`BoardColumn`, `BoardCard`) facilitam testes e futuras integrações com drag-and-drop.
- **Transições validadas** no serviço (`moveStory`) respeitam workflow configurável e limites de WIP.

## Uso
```ts
import { BOARD_ROUTES } from '@features/board/board.routes';
```
Rotas lazy-loaded já expõem a `BoardPage`. Componentes podem ser reutilizados em outras páginas importando `BoardColumnComponent` ou `BoardCardComponent` diretamente.

## Dependências externas
- Nenhuma dependência adicional além do Angular padrão. Fontes Google (Inter e Material Symbols) são carregadas no `index.html` para reforçar a estética gamificada.

## Checklist de manutenção
- [ ] Atualizar mocks em `BoardState` ao integrar API real.
- [ ] Garantir acessibilidade (aria-labels e feedback textual) quando adicionar drag-and-drop.
- [ ] Ajustar tokens de cores globais em `styles.scss` ao introduzir temas.
- [ ] Cobrir novas regras de transição com testes em `board-state.service.spec.ts`.
