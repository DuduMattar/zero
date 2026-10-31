# ZERO — rodada 2: o que foi aplicado da sua revisão e o que quero que você olhe agora

Sua revisão anterior (identidade visual + linguagem + SOS) foi aplicada em duas entregas, publicadas em 31/10/2026. Repositório público: https://github.com/DuduMattar/zero · App: https://dudumattar.github.io/zero/ · Registro das decisões: `docs/PROGRESS.md` (seções "V3 — entrega 1" e "V3 — entrega 2").

## Aplicado como você propôs

- **SOS:** três saídas, "Diminuiu / Continua / Fumei" (o rótulo vira "Vapei" ou "Fumei/vapei" conforme os produtos do perfil). "Continua" leva a uma tela que oferece trocar estratégia, ler motivos ou sair guardando o registro, no mesmo episódio. Uma estratégia visível por vez, instrução maior que o cronômetro, "Trocar estratégia" em folha. Frase "Vontade passa. Fica com ela." removida. "Fumei" sem estilo de perigo.
- **Linha de base:** a vontade só conta como "antes" se avaliada nos primeiros 20 s (escala opcional na tela de abertura, com rótulo "opcional" e âncoras). Depois disso é avaliação intermediária. A comparação de estratégias usa só episódios com linha de base real e mostra "N× · M medidas". Código: `src/domain/craving.ts` (`BASELINE_WINDOW_SEC`, `cravingDrop`).
- **Relógio de saúde:** "Seu corpo agora" virou "Referência de recuperação": "Há X desde o início desta tentativa. Para quem parou de fumar, estudos descrevem por volta deste prazo:" + marco. Marcos passados dizem "prazo passado", não "alcançado". Nota: "Média de estudos, não medição do seu corpo."
- **Painel:** número principal nomeado pelo produto ("12 dias sem cigarro, somados entre seus períodos"), "Agora: há X desde o último uso", "Maior período contínuo". "Uma ação para hoje", "Como você está", "Registrar um uso". Estratégias renomeadas ("Esperar antes de decidir", "Notar a vontade, sem agir", "Ler meus motivos").
- **Mensagens:** dias 1 (distingue parar a nicotina de estar em reposição), 14, 30 e 60 reescritas sem estatística sem fonte. Texto pós-uso na sua versão.
- **Identidade:** sua paleta (contrastes recalculados por mim antes de aplicar), Manrope + Source Sans 3 (self-hosted, só latim), número principal e trilhas sem card, cards de 20 px só para ação/referência/mensagem/humor, entrada escalonada removida, ícones vetoriais (olho para modo discreto, engrenagem, abas), humor rápido sem emojis (1–5 com rótulo), calendário com símbolo (• lapso, — recaída) e legenda, ícone do app e `theme-color` nas cores novas.

## Rejeitado ou ajustado, e por quê

- "Usei cigarro, vape ou nicotina" não cabe em botão; virou "Fumei"/"Vapei" e a tela seguinte pergunta o produto.
- Sua reescrita do dia 0 era mais genérica que a atual e não corrigia nada; mantive a atual. Gosto, não evidência.
- O mecanismo do relógio (um uso isolado não reinicia a referência; recaída com novo marco, sim) continua. O que mudou foi a apresentação, conforme seu terceiro ajuste.
- **Reposição de nicotina não é uso.** Adesivo, goma e pastilha nunca aparecem em "Registrar um uso", nunca tocam no contador principal, e com reposição declarada a trilha de nicotina mostra "em reposição". Novo: estratégia "Goma ou pastilha de reposição" no SOS (só para quem declarou reposição), que registra dose, não uso. Sachê e goma fora de tratamento continuam contando só na trilha "sem nicotina".

## Decisões fora do seu escopo que afetam o produto

- Chat com IA: adiado. Pode virar recurso pago no lançamento (exigiria servidor). Por enquanto, sem IA.
- O app deixou de se chamar "assistente pessoal". Primeira tela: "Para parar de fumar. Sem conversa, com registro."
- Lição de iOS: remover o app da tela de início apaga os dados. Aviso adicionado na instalação, nos Ajustes e no onboarding.

## O que eu quero de você agora

1. **Olhe o resultado, não a intenção.** Leia `src/features/sos/Sos.tsx`, `src/features/dashboard/Dashboard.tsx`, `src/app/styles.css`, `src/content/messages.pt-BR.ts`. Diga onde a execução ficou abaixo do que você propôs, com arquivo e linha.
2. **SOS em uso real:** alguém no dia 3, 23h, vontade 8. Abre o SOS. Simule a sequência de toques até salvar e diga onde há atrito, texto demais, ou decisão exigida na hora errada.
3. **Linha de base de 20 s:** é uma janela defensável? Alternativa melhor sem bloquear a respiração?
4. **A tela "Continua":** ela cumpre "trocar estratégia, buscar apoio ou sair sem fracasso"? O que falta em "buscar apoio" sem servidor e sem IA?
5. **Identidade:** com a paleta aplicada, o que ainda parece genérico? Seja específico (componente, tela).
6. **Mensagens e plano de 90 dias:** leia `src/content/messages.pt-BR.ts` e `src/content/plan90.pt-BR.ts` inteiros e aponte toda frase que faça afirmação sem fonte, prometa resultado, ou julgue. Tabela antes/depois, como da outra vez.
7. **Próximas três candidatas gratuitas e offline**, na ordem que eu planejo: (a) áudio gravado pelo próprio usuário para tocar no SOS; (b) "pedir ajuda" em um toque, WhatsApp com mensagem pronta para pessoa de confiança; (c) guia de automações por evento no Atalhos do iOS (etiqueta NFC na máquina de café, ao abrir um app, ao conectar ao carro), já que os gatilhos do usuário são por evento, não por hora. Critique a ordem e o valor de cada uma. Cite evidência quando houver; marque opinião quando não houver.

Mesmas regras de antes: fonte ou "opinião"; nada que exija servidor, serviço pago ou coleta de dados; não elogie.
