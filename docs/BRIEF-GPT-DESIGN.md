# ZERO — pedido de revisão: identidade visual e linguagem

Você é diretor de design e especialista em mudança de comportamento para cessação de tabagismo. Revise o app abaixo e proponha uma identidade própria (cor, tipografia, forma, movimento) e um sistema de linguagem. Critério: tudo o que você propuser precisa ser defensável com evidência ou declarado como opinião de design. Não invente "psicologia das cores".

## O que é o ZERO

- App pessoal, de uso individual, para parar de fumar cigarro, vape/pod e nicotina. Usuário de 22 anos, iPhone.
- PWA offline-first: React, TypeScript, Tailwind v4, IndexedDB. Sem servidor, sem conta, sem IA, sem serviços pagos. Tudo em pt-BR.
- Ao vivo: https://dudumattar.github.io/zero/ (renderiza no cliente; screenshots anexados mostram as telas).
- Telas: painel (contadores, "Seu corpo agora", mensagem do dia, plano de hoje, humor rápido), SOS (cronômetro + estratégia guiada + avaliação da vontade antes/depois), lapso/recaída, diário (6 escalas 1–5 + vontade 0–10), histórico com calendário, linha do tempo de recuperação com fontes (NHS, INCA, CDC), tendências com gráficos, conquistas, ajustes.

## Decisões já tomadas (não reabrir)

1. Contadores refletem a realidade: lapso encerra a sequência; não existe "manter sequência". Histórico, recorde e acumulado nunca se perdem.
2. Quatro trilhas separadas: sem combustão, sem vape, sem tabaco ou vape (geral), sem nicotina (com estado "em reposição de nicotina").
3. Nenhum dado de saúde inventado. Marcos de recuperação têm fonte e rótulo de evidência (forte / moderada / limitada). Nada causal sobre os registros do usuário ("nos seus registros, X teve a maior queda" e nunca "X funciona").
4. Sem imagem de cigarro, fumaça, cinzeiro ou vape em lugar nenhum (reatividade a pistas).
5. Sem vergonha, sem culpa, sem "você falhou". Lapso é tratado como dado, não como derrota.
6. Dynamic Type do iOS (o app herda o tamanho de fonte do sistema), modo escuro e claro, movimento reduzido respeitado.

## Estado atual do visual (o problema)

Parece um app genérico gerado por IA em 2026: Inter, cards arredondados, cinza-escuro, um verde de destaque, tom neutro. Nada nele diz "ZERO".

Tokens atuais:

```css
/* claro */            /* escuro */
--bg: #f5f6f8;         --bg: #0a0d12;
--card: #ffffff;       --card: #141a22;
--card-2: #f1f3f6;     --card-2: #1b222c;
--line: #e2e5ea;       --line: #232c37;
--ink: #0e1217;        --ink: #eef2f6;
--ink-2: #4b5563;      --ink-2: #aab4c0;
--ink-3: #8b94a1;      --ink-3: #6f7a87;
--accent: #0f9d6e;     --accent: #2fd38a;   /* verde: livre, progresso */
--warn: #b7791f;       --warn: #e4b35a;     /* lapso */
--danger: #c53d3d;     --danger: #f06b6b;   /* recaída, apagar */
--calm: #2f6fdb;       --calm: #6ea3ff;     /* SOS, respiração */
```

Fonte: Inter Variable (self-hosted). Raio dos cards: 24 px. Animação: pulso de respiração 4-4-6 no SOS, entrada escalonada dos cards.

## Estado atual da linguagem (amostras reais)

- Painel: "Dias livres acumulados" · "Desde o último consumo" · "Seu corpo agora" · "Como foi hoje?" · "Fumei ou usei nicotina? Registrar lapso".
- SOS: botões "Passou" / "Fumei"; estratégias "Respiração guiada", "Adiar 10 minutos", "Observar a vontade", "Beber água", "Caminhada curta", "Mudar de ambiente", "Relembrar meus motivos".
- Mensagem do dia 0: "Hoje você não precisa vencer nada. Só precisa chegar até a hora de dormir sem fumar. Uma vontade de cada vez."
- Dia 1: "A nicotina está saindo do corpo. Irritação, fome e inquietação são o sistema recalibrando, não um sinal de que você está falhando."
- Dia 30: "Um mês. O risco de recaída cai bastante daqui em diante, mas não some. Os meses seguintes são de atenção, não de vigilância."
- Plano de hoje (uma tarefa curta por dia, 90 dias): "Mapeie seus momentos", "Treine o SOS", "Água à mão", "Dê destino ao dinheiro", "Plano de emergência".
- Após lapso: tela protetora dizendo que o relógio de saúde do corpo não zerou, só a sequência.

## O que eu quero de você

### A. Identidade visual própria

1. Uma direção de identidade com nome e justificativa em 5 linhas. O que o ZERO deve parecer que nenhum outro app de parar de fumar parece.
2. Paleta completa em hex, claro e escuro, mantendo os mesmos papéis (bg, card, line, ink ×3, accent, warn, danger, calm). Exija contraste WCAG AA em texto normal e indique o contraste de cada par texto/fundo.
3. Tipografia: uma ou duas famílias gratuitas, disponíveis no Google Fonts ou Fontsource (precisam ser self-hosted para funcionar offline), com licença OFL. Diga qual para títulos e números grandes, qual para texto, pesos, e por que não Inter. Considere que números tabulares são obrigatórios nos contadores.
4. Forma e movimento: raio, espessura de linha, uso de preenchimento vs. borda, o que animar e o que não animar. O SOS precisa ser a tela mais calma do app, e deve ser dito o que isso significa em termos concretos.
5. Para cada escolha, separe claramente: (a) o que tem evidência (legibilidade, contraste, carga cognitiva, acessibilidade), (b) o que é convenção de produto, (c) o que é gosto. Se você afirmar que uma cor "reduz ansiedade" ou "inibe o desejo", cite o estudo ou retire a afirmação.

### B. Sistema de linguagem

1. Voz do ZERO em 10 regras curtas (o que dizemos, o que nunca dizemos).
2. Reescreva as amostras acima, lado a lado, antes e depois, com a razão de cada mudança.
3. Fundamente nas técnicas de mudança de comportamento com evidência em cessação: automonitoramento, intenções de implementação, enquadramento de identidade ("não fumo" vs. "estou tentando parar"), tratamento do lapso (efeito de violação da abstinência), enquadramento de ganho vs. perda, autonomia (teoria da autodeterminação). Cite as fontes (taxonomia de Michie e colegas, revisões Cochrane sobre apps e mensagens, diretrizes NHS/CDC/INCA). Diga o que é consenso e o que é evidência fraca.
4. Diga em que momentos o app deve falar pouco ou nada. Mais texto não é melhor.

### C. Crítica livre

O que no app atual atrapalha alguém que está no dia 3 e com vontade agora? Seja direto. Não elogie.

## Formato da resposta

- Tokens em CSS variables prontos para colar.
- Fontes com nome exato, licença e pacote Fontsource.
- Frases em tabela antes/depois.
- Afirmações sobre comportamento com fonte. Sem fonte, marque como "opinião".
- Nada que exija servidor, serviço pago ou coleta de dados.
