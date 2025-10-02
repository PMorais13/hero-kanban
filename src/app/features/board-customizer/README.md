# Feature: Personalização do quadro

## Objetivo
Permitir que a guilda adapte o fluxo de trabalho ativando ou criando novas etapas diretamente por meio de uma rota dedicada.

## Decisões técnicas
- Utilização do `HeroControlState` para manter as etapas sincronizadas entre o shell e a página de edição.
- Componentização standalone com lazy-loading para evitar impacto no bundle inicial.

## Exemplos de uso
A rota `/quadro/personalizar` carrega `BoardCustomizerPageComponent`, que expõe toggles e formulário ligados ao estado compartilhado.

## Checklist de manutenção
- Cobrir novas ações com testes unitários no estado compartilhado.
- Garantir acessibilidade das interações (foco e rótulos).
- Revisar limites de performance ao ampliar o número de etapas.
