# Feature Explorer

## Objetivo
Oferecer uma visão dedicada das features estratégicas e das histórias que as sustentam, permitindo que a guilda compreenda rápida
mente o contexto, o progresso e o impacto de cada missão antes de mergulhar no quadro Kanban.

## Decisões técnicas
- **Reaproveito do `BoardState`** para manter fonte única de verdade para features e histórias, evitando divergência de dados.
- **ViewModels específicos** (`FeatureOverviewCardViewModel`, `FeatureDetailViewModel`) preparados em `FeatureExplorerState` ga
rantem que o template receba apenas o necessário para renderizar cartões responsivos.
- **Signals + `computed`** mantêm a UI sincronizada com updates do `BoardState`, permitindo futuras integrações com API sem alt
erar os componentes.
- **Tipagem forte** herdada dos modelos do quadro (`Feature`, `Story`) para assegurar consistência entre páginas.

## Uso
```ts
import { FEATURE_EXPLORER_ROUTES } from '@features/feature-explorer/feature-explorer.routes';
```
As rotas lazy-loaded expõem duas páginas standalone:
- `FeatureCatalogPage`: catálogo com cards de features e métricas principais.
- `FeatureDetailPage`: detalhes da feature com cards das histórias vinculadas.

## Dependências externas
Nenhuma dependência adicional além do Angular padrão. Reutiliza tokens de cor globais definidos em `styles.scss` para manter a e
stética neon do app.

## Checklist de manutenção
- [ ] Atualizar mocks em `BoardState` quando integrações reais entregarem dados de features/histórias.
- [ ] Avaliar paginação/agrupamento se o número de histórias crescer.
- [ ] Medir contraste dos cartões em temas alternativos.
- [ ] Adicionar testes de integração ao navegar entre catálogo e detalhe quando o roteamento ganhar mais regras.
