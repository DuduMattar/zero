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

## V3 — entrega 1 (SOS e linguagem) publicada em 31/10/2026

Origem: revisão externa (GPT) sobre identidade e linguagem; triagem em `docs/BRIEF-GPT-DESIGN.md`.
Feito:
- SOS com três saídas: **Diminuiu / Continua / Usei**. "Continua" permite trocar estratégia ou ler motivos e seguir no mesmo episódio, ou sair guardando o registro (`outcome: 'continued'`). "Usei" não tem estilo de perigo.
- Linha de base honesta: a vontade só conta como "antes" se avaliada nos primeiros 20 s (`BASELINE_WINDOW_SEC`); fora disso vira avaliação intermediária. `cravingDrop` só existe com linha de base real; episódios sem ela ficam registrados, mas fora da comparação de estratégias (`measured` separado de `n`).
- Uma estratégia visível por vez, instrução maior que o cronômetro, "Trocar estratégia" em folha. Removida a frase "Vontade passa. Fica com ela."
- Painel: número principal nomeado pelo produto ("dias sem cigarro / sem vape / sem tabaco ou vape, somados"), "Agora: há X desde o último uso", "Maior período contínuo".
- "Seu corpo agora" → "Referência de recuperação": tempo desde o início da tentativa + "para quem parou de fumar, estudos descrevem"; marcos passados mostram "prazo passado", não "alcançado". Nota "média de estudos, não medição do seu corpo".
- "Plano de hoje" → "Uma ação para hoje"; "Como foi hoje?"/"Diário" → "Como você está"; "Registrar lapso" → "Registrar um uso"; estratégias "Esperar antes de decidir", "Notar a vontade, sem agir", "Ler meus motivos".
- Mensagens dos dias 1 (ciente de reposição de nicotina), 14, 30 e 60 reescritas sem estatística sem fonte. Texto pós-uso sem prometer relógio fisiológico.
Testes: 49 unitários, 8 ponta a ponta (SOS: linha de base, continua + troca, sessão sem linha de base, uso pelo SOS com histórico preservado).

## V3 — entrega 2 (identidade visual) publicada em 31/10/2026

Direção "espaço para seguir" (revisão externa; contrastes AA recalculados e conferidos): fundo mineral quente no claro, verde profundo no escuro, destaque em verde seco. Tokens em `src/app/styles.css`.
- Tipografia: Manrope Variable (títulos, números, rótulos; `.display`/`.tabular`) + Source Sans 3 Variable (texto). Self-hosted, OFL, só subconjuntos latinos (4 arquivos woff2, ~130 kB), no cache do service worker.
- Hierarquia: número principal e trilhas sobre o fundo da página, sem card; cards de 20 px só para ação, referência, mensagem e humor. Entrada escalonada removida.
- Ícones vetoriais únicos (`src/ui/icons.tsx`): olho/olho cortado para o modo discreto, engrenagem, abas. Sem emojis decorativos: humor rápido mostra 1–5 com rótulo.
- Calendário com símbolo além da cor (• lapso, — recaída) e legenda.
- SOS: cronômetro pequeno no topo, instrução dominante, círculo de respiração em `calm`; escala inicial com "opcional" e âncoras.
- Ícone do app, `theme-color`, manifest e imagem de compartilhar nas cores novas.
Testes: 49 unitários, 8 ponta a ponta. Capturas claro/escuro conferidas no Chrome emulando iPhone 13; não testado em iPhone real.

## V3 — entrega 3 (rodada 2 da revisão externa) publicada em 31/10/2026

Origem: `docs/BRIEF-GPT-ROUND2.md` + resposta do revisor, que usou o site publicado. Dois conjuntos, publicados juntos.

**3a · SOS, persistência e apoio**
- **Bug desde a V1:** `button, input… { font: inherit; color: inherit }` fora das camadas do Tailwind anulava `text-accent-ink`, peso e tamanho dos botões (contraste 1,4:1 no escuro). Resets agora em `@layer base`, classes de componente em `@layer components`. Teste ponta a ponta mede o estilo computado do botão principal.
- **Bug:** `useData` entregava `DEFAULT_SETTINGS` enquanto os ajustes carregavam; o SOS abria "do zero" e sobrescrevia o rascunho. Agora `useData` só retorna com ajustes carregados.
- Episódio do SOS gravado em `settings.sosDraft` a cada passo; retomado ao reabrir (até 6 h); painel mostra "Voltar à vontade em andamento". "Fechar" abre folha: salvar como *encerrada sem avaliação final* (`outcome: 'abandoned'`) ou *descartar* (abertura acidental). Sem corte de 30 s.
- `strategies[]` guarda todas as estratégias da sessão; trocar reinicia o tempo sugerido. Só sessões de estratégia única com ≥ 2 medidas entram na comparação (`comparable`); registros antigos sem `strategies` ficam fora. Tabela em Tendências é descritiva, ordenada por uso; **a sugestão automática de "melhor estratégia" foi removida**. Estratégia de abertura escolhida pelo usuário em Ajustes (`favoriteStrategy`).
- Nenhuma avaliação é "pré-intervenção": o campo `intensityBefore` passa a significar *primeira avaliação, aos X s*; "variação" = primeira − última.
- Reposição: escolher a estratégia não registra dose. Na saída, se `nrt_fast` esteve na sessão (mesmo após troca), pergunta "Você usou a reposição?" com tipo; dose gravada com o horário da confirmação.
- Tela "Continua": "O que ajudaria agora?" → Tentar outra estratégia / Falar com {pessoa de apoio} (WhatsApp `wa.me` com mensagem pronta, nada enviado sozinho) / Encerrar e salvar; "Ler meus motivos" só se há motivos. Disque 136 saiu do SOS. `profile.support` editável no Perfil.
- Saída "Diminuiu": gatilhos recolhidos em "Adicionar contexto". Botão de uso: "Fumei" / "Vapei" / "Usei" (sachê ou mistura); sem reposição na sessão, vai direto ao registro de uso.
- Escala 0–10 em duas linhas, alvos de 12 de altura. Círculo só na respiração; primeira instrução em destaque.
- Rótulos: "Vontade diminuiu" / "Vontade continuava ao sair" / "Encerrada sem avaliação final"; contagens "sem uso" = diminuiu + continuava (conquistas, revisão, painel).

**3b · Painel e conteúdo**
- Ordem: SOS → contador → Como você está → Uma ação para hoje → revisão → referência → mensagem → trilhas. Referência sem barra nem contagem regressiva. Ação da mensagem do dia só aparece quando não há "Uma ação para hoje". Em recaída, `RELAPSE_MESSAGE` no lugar da mensagem do dia.
- Primeira tela: "Ajuda na vontade. Clareza no seu progresso."
- `messages.pt-BR.ts` e `plan90.pt-BR.ts` reescritos com a tabela do revisor, encurtada: afirmação clínica delimitada a cigarro e com cautela (reposição: +50–60% segundo Cochrane, não "dobra"); instrução direta sem ressalva; nada presume estado; dia 3 sem "72 horas"; dia 80 cita marcos que existem (9 meses, 1 ano); dia 67 aponta para o campo que o SOS lê.
Testes: 49 unitários, 9 ponta a ponta (inclui: rascunho sobrevive a recarregar, WhatsApp sem envio, fechar sem duplicar nem inventar dose, contraste computado).

**3c · integridade (rodada 3 do revisor)**
- Salvar o SOS é uma transação só (`saveCravingSession`): episódio + dose confirmada + limpeza do rascunho, com `put` e ids estáveis (`state.id`, dose `${id}-nrt`). Falha no meio não deixa metade gravada; repetir não duplica. Teste unitário com falha injetada.
- Rascunho antigo (> 6 h desde o último passo) não é descartado nem retomado em silêncio: folha "Você deixou um SOS aberto" → encerrar (fim no último passo gravado, não agora) / retomar / descartar. Formato do rascunho: `{ state, updatedAt }`.
- Pergunta de reposição em todas as saídas (Diminuiu, Continua, uso, Fechar) quando a estratégia esteve na sessão; responder é opcional; horário da dose = confirmação, editável.
- "Ler meus motivos" entra em `strategies` como recurso combinado: a sessão sai da comparação por estratégia.
- Testes ponta a ponta renomeados pelo que verificam: recarga do app e link preparado, **não** a suspensão real do iOS nem a abertura do WhatsApp. Fluxo com reposição coberto (sem dose ao escolher; uma dose ao confirmar, mesmo após troca e saída por "Continua"/"Fechar").
Testes: 53 unitários, 10 ponta a ponta.

## Futuro — decisões tomadas em 31/10/2026

- **Chat com IA: adiado.** Decisão do usuário: pode virar recurso pago para terceiros no lançamento; por enquanto, não. Quando entrar, exige servidor (chave da API nunca no aparelho de terceiros; cobrança e controle de uso), ou seja, o ZERO deixa de ser "sem backend" nesse dia. Para uso pessoal antes disso, a alternativa é chave própria colada em Ajustes (só no aparelho), opt-in, com aviso de que os dados saem do aparelho. Requisitos já definidos: contexto compacto (dias, produtos, lapsos recentes, motivos, gatilhos), regras fixas (nada causal, nada de culpa, nada de dose, SAMU 192 e CVV 188 em crise), bateria de ~20 mensagens de vontade antes de ligar.
- **Pedir ajuda: entregue em 31/10** (pessoa de apoio no Perfil; abre o WhatsApp com mensagem pronta; exige rede e o app do WhatsApp, não é offline).
- **Próximas candidatas, em ordem:** (1) guia de automações do Atalhos **por evento** (etiqueta NFC, abrir um app, conectar ao carro), já que os gatilhos do usuário são por evento, não por hora; é um guia, não instalação automática; (2) áudio gravado pelo próprio usuário para tocar no SOS, testado antes com uma gravação no próprio iPhone. Nenhuma das duas tem evidência direta; são hipóteses de utilidade.
- **Descartado:** modelo rodando no iPhone (instável em PWA), chat sem contexto, "IA" por regras fingindo conversa.

## V2 — pendente

Relatório PDF via impressão, carta para o futuro, esportes (entrada manual), som opcional no SOS (sem vibração: API indisponível no iOS Safari), "ver mensagens anteriores", `.ics` com marcos para o Calendário.

## Histórico do plano V2 (concluído; mantido como referência)

Consumo em unidades do usuário; três abas e respiro; linha do tempo com fontes; mensagem do dia; Tendências; conquistas; plano de 90 dias; dinheiro e objetivos; NRT com doses; plano de emergência, motivos, revisão semanal, modo discreto, CSV; perfil editável; Dynamic Type. O marco "hoje seu corpo…" foi substituído por "Referência de recuperação" (média de estudos, sem medição individual).
