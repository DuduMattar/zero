# Progresso

## V1 — concluída em 30/10/2026

Entregue: onboarding, painel, SOS invertido com avaliações intermediárias, lapsos/recaídas/novo marco com fluxo protetor, diário, histórico, ajustes, backups (externo + snapshots locais + testar restauração), tema claro/escuro, movimento reduzido, PWA offline, deploy no GitHub Pages.

Ajustes do benchmarking já aplicados na V1: SOS alívio-primeiro; manchete = dias acumulados + recorde sem segundos; fluxo pós-lapso protetor; deep link `?open=sos`; "testar restauração".

Testes: 25 unitários (trilhas, dinheiro, SOS, backup, formatação) e 6 ponta a ponta (Chrome, viewport iPhone 13). Não testado em iPhone real: instalação, compartilhar backup para o iCloud, comportamento do Atalhos.

## Como continuar

Ordem sugerida para a V2 (ver docs/BENCHMARKING.md, seção 10):

1. Programa de mensagens por data de parada (conteúdo diário no app + guia do Atalhos + `.ics`).
2. Linha do tempo de recuperação com fontes (CDC/NHS/OMS/INCA), rótulo de evidência e aviso para vape.
3. Módulo NRT: registro de doses, orientação do PCDT/INCA.
4. Conquistas sóbrias por marcos.
5. Dinheiro: objetivos e simulador de 5 anos.
6. Padrões e gatilhos (gráficos, limiares de amostra já em `src/domain/thresholds.ts`).
7. Coach por regras (`CoachAdapter`), plano de emergência, motivos, carta para o futuro.
8. Plano de 90 dias, revisão semanal, relatórios CSV/PDF, modo discreto, esportes (entrada manual).

Convenções: domínio puro em `src/domain` com `now` explícito; eventos append-only; nunca gravar contadores; todo texto em pt-BR; nenhum serviço pago.
