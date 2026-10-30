# ZERO V2 — mapa de melhorias e design

Data: 30/10/2026. Base: V1 publicada, benchmarking (`docs/BENCHMARKING.md`) e feedback do usuário ("muito simples", "quanto e por quanto difícil", "tudo espremido no topo").

## Princípio

Um app que a pessoa abre todo dia por 90 dias precisa de três coisas: **um motivo para abrir** (o que mudou hoje), **uma ação de um toque** (SOS, diário) e **nenhuma punição**. Tudo abaixo serve a isso. Restrições mantidas: offline-first, sem backend, sem custo, sem IA, sem apostas, sem dado inventado.

## 1. Sistema visual

- **Espaço:** escala de 8. Margem da tela 20 px; espaço entre seções 24 px; padding de card 20 px. Nada precisa caber acima da dobra; a tela rola.
- **Tipografia:** Inter variável. Número-herói 64 px (tabular), título de tela 28 px, título de card 18 px, corpo 16 px, legenda 13 px. **Dynamic Type:** `html { font: -apple-system-body }` no iOS para herdar o tamanho de fonte do sistema; escala em `rem`.
- **Cor:** dark-first, fundo quase preto, um acento verde para "livre"; âmbar para preparação e reposição de nicotina; cinza para recaída; vermelho só em ação destrutiva. Modo claro espelhado.
- **Movimento:** com propósito e curto. Número-herói sobe em contagem na abertura (300 ms); cards entram com atraso de 40 ms; anel de respiração no SOS. Tudo desligado com "reduzir movimento". Sem confete, sem mascote.
- **Toque:** alvos ≥ 44 pt; botões principais 56 px; chips 40 px.
- **Estados:** carregando = skeleton (não "Carregando…"); vazio = o que fazer; erro = o que aconteceu + tentar de novo.

## 2. Arquitetura: 3 abas + engrenagem

| Aba | Conteúdo |
|---|---|
| **Agora** | SOS · herói (dias acumulados / recorde / sequência) · **card do dia** (marco de recuperação) · **mensagem do dia** · trilhas · "Como foi hoje?" (diário em 1 toque) · lapso como link discreto |
| **Tendências** | seletor 7 d / 30 d / tudo · fissuras por dia · intensidade e queda por estratégia · humor e sono · dinheiro, projeção e objetivos · gatilhos e horas (com limiar de amostra) · conquistas |
| **Histórico** | linha do tempo de recuperação completa · calendário de dias (livre / lapso) · episódios · eventos com filtros · exportar CSV |
| ⚙ Ajustes (ícone no topo) | perfil e produtos editáveis · consumo e preço · marco · NRT · backups · instalação e Atalhos · aparência · modo discreto · sobre |

Diário sai da barra de abas e vira um card no "Agora" (humor em 1 toque abre a folha completa). SOS também acessível por deep link `?open=sos`.

## 3. Correções pedidas

### 3.1 Consumo sem conta de cabeça
Componente `ConsumoInput`, usado no onboarding e nos Ajustes. Pergunta na unidade em que a pessoa pensa:

| Produto | Pergunta | Chips | Preço |
|---|---|---|---|
| Vape/pod | "Um pod dura quanto tempo?" | 1 dia · 2 · 3 · 5 · 1 semana · 2 semanas | preço do pod |
| Cigarro | "Quantos por dia?" | ½ maço · 1 maço · 1½ · 2 · ou nº de cigarros | preço do maço (20) |
| Tabaco enrolado | "Um pacote dura quanto tempo?" | 3 dias · 1 sem · 2 sem | preço do pacote |
| Sachê | "Uma lata dura quanto tempo?" | 1 dia · 2 · 3 · 1 sem | preço da lata |
| Tabaco aquecido | "Quantos sticks por dia?" | 5 · 10 · 20 | preço do maço |

Conversão para `unitsPerDay` + `pricePerUnit` fica no domínio (`consumption.ts`), testada. Prévia ao vivo: "≈ R$ 180 por mês · R$ 2.160 por ano". Botão "Não sei" desliga a seção de dinheiro sem travar nada.

### 3.2 Respiro
Aplicar o sistema visual acima em todas as telas. Telas curtas (onboarding, saída do SOS, pós-lapso) centralizam verticalmente. Painel deixa de ser grade apertada 2×2 e passa a ser lista de cards com um número grande por card.

## 4. Conteúdo (o que faz o app "parecer de verdade")

- **Linha do tempo de recuperação:** marcos de 20 min a 15 anos, cada um com fonte oficial e link, rótulo de evidência (forte/moderada/limitada) e aviso para vape ("prazos de estudos com cigarro; para vape a evidência é limitada"). Sem percentuais inventados. Card do dia no "Agora" mostra o marco atual, o próximo e quanto falta. Marco alcançado abre uma folha uma única vez (nunca durante o SOS).
- **Mensagem do dia:** programa do dia −7 ao dia 90 (97 textos curtos, pt-BR, tom direto, sem clichê), ancorado na data de parada; depois do dia 90, mensagens semanais. Modo "ainda não parei" mostra os 7 dias de preparação. Entregue no app + guia do Atalhos + `.ics`.
- **Plano de 90 dias:** 4 fases, uma atividade de ≤ 2 min por dia, marcável como feita (evento `activity_done`).
- **Conquistas sóbrias:** por tempo (24 h, 3 d, 7 d, 14 d, 30 d, 60 d, 90 d, 6 m, 1 a, 2 a) e por comportamento (1ª vontade superada, 10 vontades, 7 diários seguidos, 1º backup, 1º lapso registrado com lição, 30 dias sem nicotina). Sem troféu por permissão ou por assinar nada.
- **Estratégias:** textos revisados; "ler meus motivos" como overlay dentro do SOS.

## 5. Detalhes de experiência

- **SOS:** sugestão da melhor estratégia (já); som opcional de ritmo (sem vibração no iOS Safari); ao sair com "Passou", mostrar "sua 14ª vontade superada"; "Fumei" leva ao lapso com só 3 campos obrigatórios (produto, quantidade, quando) e o resto em "detalhes (opcional)".
- **Diário:** card "Como foi hoje?" com 5 rostos; um toque salva humor e abre a folha para completar ou não.
- **Calendário:** grade de dias (verde livre, âmbar lapso, cinza recaída) no Histórico. Barato e muito visual.
- **Compartilhar progresso:** gera uma imagem (canvas, offline) "12 dias sem fumar · ZERO" para mandar no WhatsApp. Serve ao uso pessoal e ao produto.
- **Revisão semanal:** domingo à noite, folha com o que melhorou, o que foi difícil, qual estratégia funcionou, o que merece atenção, calculada dos registros, com texto descritivo.
- **Modo discreto:** ícone de olho no topo esconde números e troca títulos por neutros.
- **Nudges:** instalação e backup nunca ao mesmo tempo, nunca no caminho do SOS, no máximo um por dia.
- **Perfil editável:** produtos, histórico, gatilhos, motivos, metas.
- **Acessibilidade:** Dynamic Type, contraste AA, rótulos para VoiceOver, foco visível, reduzir movimento.

## 6. O que fica de fora (decisão)

Comunidade, chatbot, push, integrações de saúde, mg/mL com redução gradual, anéis estilo Atividade, contador em segundos, "tempo de vida recuperado".

## 7. Ordem de entrega

1. **Entrega 1 (esta):** sistema visual + 3 abas + consumo fácil + card do dia + linha do tempo com fontes + mensagem do dia + calendário + conquistas básicas + Tendências com gráficos iniciais.
2. **Entrega 2:** plano de 90 dias, revisão semanal, objetivos de dinheiro e simulador, compartilhar progresso, modo discreto, perfil editável, NRT.
3. **Entrega 3:** relatórios CSV/PDF, carta para o futuro, plano de emergência, esportes.

Cada entrega: testes unitários do domínio novo, Playwright dos fluxos, build, deploy, e teste seu no iPhone antes da próxima.
