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

## V2 — entrega 1 publicada em 30/10/2026

Feito: sistema visual com respiro e Dynamic Type; 3 abas (Agora / Tendências / Histórico) + engrenagem; consumo na unidade da pessoa com prévia de custo e opção "não sei"; card "Seu corpo agora" + linha do tempo com fonte, rótulo de evidência e aviso para vape (fontes em docs/FONTES.md); mensagem do dia (−7 a 90, depois semanal); diário em 1 toque pelo humor; Tendências com gráficos (vontades, humor/sono, dinheiro com projeção, estratégias, gatilhos/horas, conquistas); calendário de 28 dias; conquistas por tempo e comportamento gravadas em silêncio quando atrasadas.
Testes: 35 unitários, 7 ponta a ponta.

## Estabilização após revisão externa (30/10/2026)

Aplicado: relógio de saúde separado da sequência contínua (lapso isolado não zera a linha do tempo; recaída/novo marco zera); lapso com duração opcional ("até"); lapso antes do marco inicial ignorado; testes de invariantes (sem sobreposição, sem duração negativa, total ≤ decorrido, ordem de registro irrelevante, eventos futuros ignorados, NRT + cigarro); 17 mensagens reescritas sem certezas sem fonte e sem tom de culpa (inclusive a contradição dos "cílios"); rótulos da linha do tempo trocados por concordância entre fontes com critério em docs/FONTES.md; marcos de 5–10 e 10–15 anos como faixas; alerta de sintomas que pedem avaliação; pós-lapso com 3 campos obrigatórios e detalhes opcionais; aviso de que o backup JSON é legível.
Recusado (decisão): manchete = tempo desde o último consumo (mantido acumulado + recorde, com sequência em destaque); onboarding de 3 telas; remover projeção de 5 anos.
Testes: 43 unitários, 7 ponta a ponta.

## V2 — entrega 2 publicada em 30/10/2026

Feito: plano de 90 dias (uma atividade por dia, −7 a 90, marcável; evento `activity_done`); revisão semanal descritiva (esta semana vs anterior; card no painel aos domingos e sempre em Tendências); objetivos para o dinheiro com progresso pela economia líquida; compartilhar progresso como imagem gerada no aparelho; "Ler meus motivos" dentro do SOS; modo discreto (ícone no painel + Ajustes); perfil editável (produtos, gatilhos, motivos, metas/plano de emergência, história); registro de doses de reposição de nicotina com orientação SUS; exportar CSV; Tendências carregada sob demanda (chunk separado).
Testes: 47 unitários, 8 ponta a ponta.

## V2 — restante (entrega 3)
Relatório PDF via impressão, carta para o futuro, esportes (entrada manual), som opcional no SOS, "ver mensagens anteriores".

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
