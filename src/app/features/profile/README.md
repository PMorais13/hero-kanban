# Feature: Perfil do herói

## Objetivo
Oferecer uma visão consolidada do progresso do jogador dentro do Hero Kanban, destacando nível, conquistas e recompensas desbloqueadas.

## Decisões técnicas
- Consumo do estado compartilhado por meio do `HeroControlState`, garantindo consistência entre shell, perfil e demais rotas.
- Componentização standalone para facilitar lazy-loading e isolamento de estilos.

## Exemplos de uso
A rota `/perfil` carrega `ProfilePageComponent`, que lê sinais somente-leitura do estado compartilhado.

## Checklist de manutenção
- Atualizar testes do estado sempre que adicionar novas ações.
- Validar contraste dos cartões de conquistas e loots.
- Manter cópia das strings em i18n quando a camada for introduzida.
