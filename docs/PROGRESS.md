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

## V2 — escopo acordado em 30/10/2026

### Correções de experiência (pedidas pelo usuário)
1. **Consumo sem conta de cabeça.** Pergunta por produto, na unidade em que a pessoa pensa: pod → "um pod dura quantos dias?" ou "quantos pods por semana?"; cigarro → "maços por dia" ou "cigarros por dia"; tabaco enrolado → "pacotes por semana"; sachê → "latas por semana". Chips com valores típicos (ex.: 1 pod a cada 3 dias) e campo livre. Preço na mesma unidade (preço do pod, do maço, do pacote). O app converte para unidades/dia e mostra na hora: "≈ R$ 180 por mês". Opção "não sei" que desliga o dinheiro sem travar o onboarding. Mesmo componente em Ajustes.
2. **Respiro e uso da tela inteira.** Escala de espaçamento maior (16–24 px), hero do painel mais alto, cards com mais padding e tipografia maior, nada de "caber tudo acima da dobra". Telas curtas (onboarding, SOS de saída, pós-lapso) centralizam o conteúdo em vez de deixar o terço inferior vazio. Painel reorganizado em três abas (Agora / Tendências / Histórico) como no benchmarking, com estatísticas e gráficos em Tendências, para o "Agora" ter só: SOS, número principal, trilhas e mensagem do dia.

### Conteúdo e módulos (ordem)
3. Linha do tempo de recuperação com fonte, rótulo de evidência e aviso para vape.
4. Mensagem do dia ancorada na data de parada (dia −7 a +90) + guia do Atalhos + `.ics`.
5. Tendências: gráficos de fissuras/semana, intensidade média, humor, sono, estratégias (limiares de amostra).
6. Conquistas sóbrias (marcos de tempo + comportamento: primeira vontade superada, 7 diários seguidos, primeiro backup).
7. Plano de 90 dias em 4 fases, uma atividade curta por dia.
8. Dinheiro: objetivos e simulador de 5 anos.
9. Módulo NRT: registro de doses, lembrete via Atalhos, orientação PCDT/INCA.
10. Plano de emergência, motivos com edição rica, carta para o futuro, revisão semanal, modo discreto, relatórios CSV/PDF, esportes (entrada manual).

### Melhorias menores
- Editar produtos e perfil depois do onboarding.
- "Registrar lapso" menos proeminente que o SOS no painel.
- Som opcional no SOS (sem vibração: API indisponível no iOS Safari).
- Suporte a Dynamic Type (tamanho de fonte do sistema).
- Marco de recuperação do dia no painel ("hoje seu corpo…").
