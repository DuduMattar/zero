# Benchmarking: o que os apps de cessação ensinam ao ZERO

Documento de produto/engenharia. Pesquisa feita em **30/10/2026** a partir de fontes públicas (lojas, sites oficiais, FAQs, políticas, artigos revisados por pares). Nenhum app foi executado; fluxos internos são reconstruídos a partir de documentação e marcados como tal. Rótulos de evidência: **Confirmado** (fonte oficial/primária), **Terceiros** (avaliações, imprensa, agregadores), **Não verificado** (sem fonte ou só marketing).

---

## 1. Resumo executivo

**As cinco descobertas mais importantes**

1. **Apps, como categoria, não têm eficácia demonstrada; o que funciona é o que o app entrega, não o app.** A Cochrane de 2019 pôs apps em RR 1,00 (IC 0,66–1,52; evidência de certeza muito baixa) e a meta-análise de 2023 em OR 1,25 (não significativo), enquanto mensagens automáticas agendadas têm RR 1,54 (certeza moderada) e app + farmacoterapia tem OR 1,79 ([Whittaker 2019](https://pubmed.ncbi.nlm.nih.gov/31638271/); [Guo 2023](https://pubmed.ncbi.nlm.nih.gov/37079352/)). O ensaio pragmático ASSET do Smoke Free (n=3.143) não achou benefício em intenção de tratar: 75% dos convidados nunca instalaram ([Jackson 2024](https://pubmed.ncbi.nlm.nih.gov/39546331/)). Contadores, linha do tempo e conquistas são andaime de retenção; o ZERO deve tratá-los assim e investir no que tem evidência: mensagens agendadas ancoradas na data de parada e suporte à reposição de nicotina.
2. **Os líderes tratam a fissura como registro, não como intervenção.** Smoke Free abre um formulário (gravidade, atividade, companhia, o que ajudou) sem exercício guiado; o fluxo do Kwit exige quatro telas (intensidade → humor → gatilho → estratégia) antes de qualquer ação de alívio; QuitNow! não tem ferramenta de fissura e manda para o chat ([Smoke Free FAQ](https://smokefreeapp.com/faq/); [ScreensDesign Kwit](https://screensdesign.com/apps/quit-smoking-for-good-kwit/), Terceiros). O SOS planejado do ZERO (intensidade inicial → gatilho → estratégia → cronômetro) reproduz o erro do Kwit: dado antes do alívio.
3. **Nenhum concorrente separa "sem fumar" de "sem nicotina".** O mais próximo é o livro-razão de nicotina do Kwit Premium (adesivos, gomas, pods, líquidos, com custos descontados da economia), mas sem um estado "livre de nicotina" distinto ([Kwit FAQ](https://info.kwit.app/en/faq)). As quatro trilhas do ZERO (combustão / vape / tabaco-ou-vape / nicotina com estado de NRT) são o diferencial real do produto. É o único item em que o ZERO é objetivamente superior ao mercado.
4. **A política de zerar o contador é a decisão de produto mais contestada da categoria, e o ZERO escolheu a variante mais punitiva.** Usuários descrevem o reset após lapso como "um sentimento horrível"; a geração 2025–26 de apps de vape adota "modo suave" (mantém sequência, registra lapso) ou arquiva a sequência anterior ([JustUseApp Smoke Free](https://justuseapp.com/en/app/577767592/smoke-free-quit-smoking-now/reviews), Terceiros; [App Store id6756565950](https://apps.apple.com/app/id6756565950)). A literatura de lapso mostra que a autoeficácia pós-lapso, não a culpa, prevê o tempo até o próximo lapso ([PMC3296289](https://pmc.ncbi.nlm.nih.gov/articles/PMC3296289)). O ZERO preserva `totalFree` e `best` (correto), mas o número principal da tela zera automaticamente a cada lapso.
5. **As reclamações dominantes são monetização no momento de necessidade, perda de dados e linha do tempo imprecisa.** Smoke Free, Kwit, EasyQuit, Pelago e Puff Count põem paywall ou anúncio na frente da ferramenta de fissura; Smoke Free, Kwit, QuitNow! e Puff Count acumulam relatos de dados perdidos na troca de aparelho; o QuitNow! é questionado por figuras que contradizem a OMS ([App Store Puff Count](https://apps.apple.com/us/app/puff-count/id1488580640); [JustUseApp QuitNow](https://justuseapp.com/en/app/483994930/quitnow/reviews), Terceiros). O ZERO elimina a primeira por construção, mas, como PWA no iOS, está mais exposto que todos à segunda: a exclusão de dados após 7 dias sem uso torna o backup a funcionalidade mais importante do app.

**As três mudanças mais valiosas para o ZERO**

1. **Inverter o SOS: alívio primeiro, dado depois.** Abrir direto em cronômetro + respiração guiada; capturar intensidade com um toque na saída ("Como está agora?"), gatilho opcional. Mantém o ciclo antes/depois (a única parte clinicamente útil do formulário do Kwit) sem o formulário.
2. **Programa de mensagens agendadas ancorado na data de parada**, modelado no This is Quitting (1 semana antes, 8+ semanas depois, palavras-chave de apoio sob demanda), entregue sem backend: conteúdo diário no app + automação do Atalhos + `.ics`. É o único mecanismo digital com evidência de classe (a) ([Graham 2021](https://pubmed.ncbi.nlm.nih.gov/33999133/); [Cochrane vape 2025](https://pubmed.ncbi.nlm.nih.gov/41288132/)).
3. **Política de contador que não pune:** número principal = dias livres acumulados + recorde; sequência atual como dado secundário; sem segundos correndo; após "fumei" no SOS, ir para um fluxo de lapso que protege a autoeficácia, nunca para um painel zerado.

---

## 2. Escopo e método

**Apps analisados em profundidade (7):** Smoke Free (23 Ltd / David Crane, Reino Unido), QuitNow! (Fewlaps SL, Espanha), Kwit (Kwit SAS, França), quitSTART (NCI/Smokefree.gov, EUA), Puff Count: Quit Vaping Now (Rodger Studio / Quiet; ex-Cravotta), Quit Vaping (Jonathan Kopp), This is Quitting (Truth Initiative; programa SMS, não app).

**Apps secundários (sinal de mecânica 2025–26):** Pelago (ex-Quit Genius), NICORETTE Stop Smoke & Vape (Kenvue), NãoPOD! (PUC-Rio), EasyQuit, Puff Count: Quit Vaping Tracker (Bazylevych), PuffFree (Makarevich), Quit Vaping (emkapps), Weanie.

**Descartados e por quê:** "Kwit – Break Bad Habits" (id6763926427) é um rastreador genérico da PragmaTec, não o Kwit SAS ([App Store](https://apps.apple.com/us/app/kwit/id6763926427)); "Quit Vaping – Grow and Wean" não existe em nenhuma loja; Easy Quit Smoking & Vaping (Harmony Hypnosis) é áudio de hipnose, não rastreador; "Vape Free" designa três apps não relacionados; Nicotinell não tem app; INCA/SUS não tem app oficial; Pelago é B2B sem português; NICORETTE retorna 404 na loja brasileira ([BR URL](https://apps.apple.com/br/app/id1189131363)).

**Método:** fetch de listagens (App Store US/BR, AppGoblin para Android), sites e FAQs oficiais, políticas de privacidade, artigos (PubMed/PMC), uma análise de 168 telas do Kwit (Terceiros). Preços em BRL são da App Store Brasil em 30/10/2026; períodos de cobrança não aparecem na maioria das listagens. Referência interna: plano aprovado do ZERO (V1 e V2).

---

## 3. Perfis dos concorrentes

### 3.1 Smoke Free (iOS 6.4.51, 03/10/2026; 4,8★ BR/602; Android 3,4M+ instalações)

| Critério | Achado |
|---|---|
| Proposta/público | "Love not smoking"; adultos fumantes de cigarro; modelo NCSCT, vendido via Boots e conselhos municipais. **Confirmado** ([site](https://smokefreeapp.com); [práticas](https://smokefreeapp.com/practices-and-procedures/)) |
| Onboarding | Data de parada (pode ser futura), cigarros/dia, preço. **Confirmado** ([FAQ](https://smokefreeapp.com/faq/)). Avaliações: assume que já parou; opção gratuita escondida. **Terceiros** |
| Dashboard/contadores | Tempo até o segundo, dinheiro, cigarros evitados, vida recuperada; "treat" com contagem regressiva; ordem personalizável (Pro). **Confirmado** |
| Linha do tempo | "15 partes do corpo"; fonte não publicada. **Confirmado (ausência)** |
| SOS/fissuras | Registro: gravidade, atividade, sentimento, companhia, o que ajudou; mapa; gráfico de declínio; tendências (Pro). Sem exercício guiado documentado. **Confirmado** |
| Técnicas | "40+ técnicas" NCSCT; Missões diárias ~30 dias (Pro); Quit Coach 90 dias (Pro); clínicas com conselheiros. **Confirmado** |
| Lapsos | "Mudar data" mantém diário e registros; "apagar tudo" é separado. Sem evento de lapso. **Confirmado** |
| IA | Chatbot roteirizado, sem texto livre. **Confirmado** |
| Gamificação | 92 selos (Pro), certificados 1–36 meses, Mural da Fama. **Confirmado** |
| Notificações | Diário/Missões/Coach não podem coexistir no mesmo horário. **Confirmado** |
| Offline/privacidade | Offline não declarado; conta obrigatória; saúde, localização precisa e compras vinculados à identidade; compartilhamento com UCL. **Confirmado** ([política](https://smokefreeapp.com/privacy-policy/)) |
| Preço (BR) | Essential R$2,90; Pro Bronze R$49,90 / R$59,90 / R$1.299,90; Platinum R$1.499,90; 10 SKUs sem período. **Confirmado** ([BR](https://apps.apple.com/br/app/smoke-free-quit-smoking-now/id577767592)) |
| Elogios/reclamações | Elogios: registro de fissuras, selos, missões. Reclamações: dados perdidos na troca de aparelho, ferramentas comportamentais pagas, coach "glitchy", sem vape/NRT. **Terceiros** ([JustUseApp](https://justuseapp.com/en/app/577767592/smoke-free-quit-smoking-now/reviews)) |
| Evidência | RCT exploratório (missões aOR 1,90; 8,5% de follow-up); ASSET: sem benefício ITT. **Confirmado** ([PMC6347038](https://pmc.ncbi.nlm.nih.gov/articles/PMC6347038); [JMIR 2024](https://www.jmir.org/2024/1/e50963)) |

### 3.2 QuitNow! (iOS 14.26.0, 20/10/2026; 4,8★ BR/7,3K; Android 5,1M+)

| Critério | Achado |
|---|---|
| Proposta/público | "Quit smoking. Own your health."; massa, 28 idiomas; "recomendado pela OMS" só no texto Android, sem documento da OMS. **Confirmado (claim)** ([site](https://www.quitnow.app/)) |
| Onboarding | Quanto fumava, quando parou, preço do maço; cadastro adiado até a primeira mensagem na comunidade. **Confirmado** |
| Dashboard | Tempo desde o último cigarro, cigarros evitados, dinheiro, "tempo recuperado" (6 min/cigarro, sem fonte); widgets e Apple Watch. **Confirmado** ([FAQ](https://www.quitnow.app/en/faq/what-is-the-time-won-back)) |
| Linha do tempo | "Baseada em dados da OMS", 3 indicadores do NHS em 2026; tempo restante só no PRO. Acurácia contestada. **Confirmado / Terceiros** |
| SOS | Nenhum em 2026; apoio = chat, curso, QuitNow AI. **Confirmado (ausência)** |
| Técnicas | Curso em formato de livro, sessões mensais com psicólogo, FAQ editorial. Sem diário ou gatilhos. **Confirmado** |
| Lapsos | "Redefinir data de parada"; o que sobrevive não está documentado; usuários tratam o reset como punição motivadora. **Confirmado / Terceiros** |
| IA | QuitNow AI baseado no curso e dados da OMS; respostas "nem sempre relevantes". **Confirmado / Terceiros** |
| Gamificação/comunidade | 80 marcos ("todos" no PRO); chat aberto com buddies, bloqueio, denúncia; moderação criticada. **Confirmado / Terceiros** |
| Exportação/offline | Exportação de dados (set/2026); offline não declarado; status page indica servidor para chat/IA. **Confirmado** |
| Privacidade | Funciona sem login (sem backup); rastreio entre apps para anúncios. **Confirmado** |
| Preço (BR) | PRO de R$13,90 a R$229,90; assinatura exibida R$23,90; app legado "PRO" US$34,99. **Confirmado** ([BR](https://apps.apple.com/br/app/quitnow/id483994930)) |
| Reclamações | Anúncios, chat/conquistas pagos, "usuário não existe" após comprar PRO, timeline imprecisa. **Terceiros** |
| Evidência | Nenhum estudo do app. **Confirmado (ausência)** |

### 3.3 Kwit (iOS 4.37.0, ~28/10/2026; 4,9★ BR/3,7K; Android 1,7M+)

| Critério | Achado |
|---|---|
| Proposta/público | TCC + Modelo Transteórico + COM-B, "validado pela OMS" (autoavaliação + revisão de conteúdo, não eficácia); 15+; PT-BR; via Wellhub. **Confirmado** ([base científica](https://info.kwit.app/en/medical-and-scientific-basis/scientific-basis-of-kwit); [OMS](https://www.who.int/initiatives/tobacco-cessation-consortium/tobacco-cessation-mobile-app-assessment)) |
| Onboarding | 27 passos / ~13 perguntas em chat com mascotes; conta antes do paywall; troféu por assinar e por permitir notificações. **Terceiros** ([ScreensDesign](https://screensdesign.com/showcase/quit-smoking-for-good-kwit)). Preparação em 9 passos com Fagerström e Horn (3 grátis). **Confirmado** |
| Dashboard | Timer + 4 cartões + check-in + grade de ações (denso); "energia" começa em 12 e cai ao registrar cigarro. **Terceiros / Confirmado** |
| Linha do tempo | Derivada de CDC/OMS, sem lista de marcos publicada. **Confirmado (parcial)** |
| SOS | "+" → o que aconteceu → emoção/contexto → estratégia (respiração, carta ao sacudir o celular, minijogo, água, goma, adesivo) → **nova avaliação de intensidade**; eficácia por estratégia. Respirações e cartas limitadas no grátis. **Confirmado / Terceiros** |
| Lapsos | Registrar cigarro não apaga progresso: energia cai, troféus de "nicotina" zeram; "Recomeçar" zera tudo (pode manter troféus/diário); mudar data exige recomeço. **Confirmado** ([FAQ](https://info.kwit.app/en/faq)) |
| NRT/vape | Premium: adesivos, gomas, pods, frascos; nicotina por dia/semana/mês/ano; lembrete de adesivo; custos descontados; redesenhado jun/2026. **Confirmado** |
| IA | "Machine learning que prevê recaída" só em marketing; nada em release notes. **Não verificado** |
| Gamificação | XP, níveis (84, Terceiros), troféus, metas, cartas; criticada como paternalista na abstinência aguda. **Confirmado / Terceiros** |
| Offline/privacidade | Conta por e-mail obrigatória; programa processado "localmente no telefone"; retenção 36 meses; acessibilidade não declarada. **Confirmado** |
| Preço (BR) | 1 semana R$5,50; 1 mês R$14,90–17,90; 12 meses R$112,90; vitalício R$124,90–139,90. **Confirmado** ([BR](https://apps.apple.com/br/app/parar-de-fumar-cigarros-kwit/id525441365)) |
| Reclamações | Preço, progresso escondido no Premium, estatísticas zeradas após login, Premium que destrava, erros de gramática. **Terceiros** |
| Evidência | Estudo real de engajamento (conclusão do programa 2–5%); sem RCT com abstinência. **Confirmado** ([JMIR mHealth 2024](https://pubmed.ncbi.nlm.nih.gov/?term=Feasibility+and+Engagement+of+a+Mobile+App+Preparation+Program+%28Kwit%29+for+Smoking+Cessation)) |

### 3.4 quitSTART (iOS 2.48; 4,6★ US/2,4K; Android 3,54★)

| Critério | Achado |
|---|---|
| Proposta/público | Gratuito, sem anúncios, NCI + FDA; originalmente adolescentes; inglês e USD apenas. **Confirmado** ([smokefree.gov](https://smokefree.gov/tools-tips/apps/quitstart)) |
| Onboarding/dashboard | "Histórico de fumo" personaliza dicas; progresso = data, contagem de fissuras/lapsos, "dias desde que entrou" (não desde que parou), USD. **Terceiros** ([Healthify NZ](https://healthify.nz/apps/q/quitstart-app)) |
| SOS | Botão de fissura abre um "quit card"; "Distract me" com minijogos; marcar hora/lugar para receber dica no mesmo contexto no dia seguinte; humor em dois botões. **Confirmado / Terceiros** |
| Lapsos | Botão de lapso com cartão "get back on track"; contador não reage. **Terceiros** |
| Gamificação | Selos; Quit Kit; compartilhamento social. **Confirmado** |
| Privacidade/offline | Sem login; funciona sem internet; só dados não vinculados. **Confirmado / Terceiros** |
| Preço | Grátis, sem IAP. **Confirmado** |
| Reclamações | Jogos que não carregam, notificações instáveis, 5 emoções apenas, design datado; manutenção desde 2021. **Terceiros** |
| Evidência | RCT de incentivo a EMA (n=152): mais engajamento, sem ganho de cessação; usabilidade MAUQ 59/80. **Confirmado** ([JMIR 2025](https://www.jmir.org/2025/1/e67630)) |

### 3.5 Puff Count: Quit Vaping Now (iOS 4.3.4; 4,3★ BR/29)

| Critério | Achado |
|---|---|
| Proposta | Contador de puffs com limite diário que decresce até uma data de parada; mg de nicotina; "Quit Buddies". Redução-primeiro, não abstinência. **Confirmado** ([US](https://apps.apple.com/us/app/puff-count/id1488580640)) |
| SOS/lapsos | Nenhum listado; "recaída" é estourar o limite do dia. **Confirmado (ausência)** |
| Linha do tempo | "Capacidade pulmonar" (BR); sem fonte. **Não verificado** |
| Privacidade | Dados de uso usados para rastreio; identificadores para publicidade. **Confirmado** |
| Preço (BR) | R$16,90 a R$499,90; avaliação relata R$49,90/semana forçados após o quiz, sem uso gratuito. **Confirmado** ([BR](https://apps.apple.com/br/app/puff-count/id1488580640)) |
| Reclamações/elogios | Elogios: "o número me acordou", redução gradual, buddies. Reclamações: paywall no download, reinstalação apaga progresso, uma só concentração para todos os puffs, pedidos de widgets/Atalhos. **Confirmado / Terceiros** |
| Evidência | "78% mais sucesso que parar de vez" sem estudo. **Não verificado** |

### 3.6 Quit Vaping (Jonathan Kopp; iOS 4.3.8; 4,9★ US/12K; 5,0★ BR/58)

| Critério | Achado |
|---|---|
| Proposta | "Tudo-em-um" para vape: timer de sequência grátis + rastreadores de puff/pod/líquido + fissuras + gatilhos + buddies + fórum + respiração/meditação + Quit Plan pago (metas diárias de redução). Inglês. **Confirmado** ([BR](https://apps.apple.com/br/app/quit-vaping/id1479615245)) |
| SOS | Respiração guiada (4 ciclos novos em 4.3.7), meditação, rastreador de fissura. **Confirmado** |
| Lapsos | Botão "break your streak" descrito como ruim após recaída. **Terceiros** |
| Privacidade | Só dados não vinculados. **Confirmado** |
| Preço (BR) | Quit Plan R$129,90/mês, R$269,90/6 meses, R$409,90/ano; Quit Coach R$32,90. **Confirmado** |
| Evidência | Nenhuma. **Confirmado (ausência)** |

### 3.7 This is Quitting (Truth Initiative; SMS DITCHVAPE → 88709, EUA)

| Critério | Achado |
|---|---|
| Proposta | Programa gratuito e anônimo por SMS para jovens; >750 mil inscritos; mensagens de outros jovens. Não instalável no Brasil. **Confirmado** ([Truth Initiative](https://truthinitiative.org/press/press-release/jama-publishes-new-study-proven-effectiveness-truth-initiatives-text-message)) |
| Mecânica | 1 mensagem/dia por data de inscrição ou de parada; 1 semana antes + 8+ semanas depois; palavras-chave COPE, STRESS, SLIP, MORE sob demanda; data pode ser redefinida por texto. **Confirmado** ([thetruth.com](https://thetruth.com/article/quitting-vaping)) |
| Lapsos | SLIP devolve apoio, não zera nada. **Confirmado** |
| Evidência | RCT 18–24 (n=2.588): 24,1% vs 18,6% aos 7 meses, OR 1,39; RCT 13–17 (n=1.503): 37,8% vs 28,0%. Autores empregados pela Truth Initiative. **Confirmado** ([PubMed](https://pubmed.ncbi.nlm.nih.gov/33999133/)) |

---

## 4. Matriz comparativa concorrentes × ZERO

Legenda: ✔ = Confirmado; (T) = Terceiros; (NV) = Não verificado; $ = pago; — = ausente/não listado; V1/V2 = conforme plano do ZERO.

| Funcionalidade | Smoke Free | QuitNow! | Kwit | quitSTART | Puff Count | Quit Vaping (Kopp) | This is Quitting | ZERO V1 | ZERO V2 |
|---|---|---|---|---|---|---|---|---|---|
| Contador desde a parada | ✔ (segundos) | ✔ | ✔ | desde a instalação (T) | taper até data | ✔ | data por SMS | ✔ (d/h/min/s) | — |
| Trilhas separadas fumo / vape / nicotina | — | — | parcial $ (ledger NRT) | — | — | — | — | ✔ (4 trilhas + estado NRT) | — |
| Rastreio NRT/vape | só conselheiros | — | ✔ $ | — | puffs + mg | puff/pod/líquido | — | NRT declarada no perfil | — |
| Dinheiro economizado | ✔ | ✔ | ✔ (desconta NRT) | USD fixo (T) | ✔ | ✔ | — | ✔ (desconta lapsos) | metas + simulador 5 anos |
| Linha do tempo com fonte citada | 15 partes, sem fonte | OMS/NHS (contestada) | CDC/OMS genérica | — | "pulmão" (NV) | "Health Benefits" | — | — | ✔ com fonte e rótulo de evidência |
| SOS com intervenção guiada ao abrir | — (formulário) | — (chat) | após 4 telas (T) | cartão + jogos | — | respiração/meditação | COPE/STRESS | formulário antes do cronômetro | — |
| Intensidade antes/depois | só gravidade | — | ✔ (T) | — | — | — | — | ✔ + avaliações intermediárias | — |
| Eficácia por estratégia | análise $ | — | ✔ | — | — | — | — | ✔ (n ≥ 10) | — |
| Diário/humor | ✔ | — | ✔ | humor | — | check-in diário | — | ✔ | revisão semanal |
| Gatilhos/padrões | mapa + tendências $ | — | emoção/contexto | hora/lugar | gráficos de uso | rastreador | — | gatilho no evento | gráficos (limiares) |
| Lapso como evento | — (muda data) | — (reset) | ✔ (energia) | contagem | — | — | SLIP | ✔ imutável | — |
| Política de reset | mantém histórico | zera (T) | suave; recomeço opcional | não reage (T) | n/a | manual (T) | nada zera | **auto-reinício; sem "manter"** | — |
| Mensagens agendadas por data de parada | missões 30 d $ | — | atividades diárias | dicas por hora/lugar | — | lembretes | ✔ (RCT) | ao abrir | plano 90 d + Atalhos/.ics |
| Push em segundo plano | ✔ | ✔ | ✔ | ✔ (instável T) | ✔ | ✔ | SMS | — (Atalhos) | — |
| Coach/chatbot | roteirizado $ | generativo | — (NV) | — | — | $ | automático | — | regras, "não IA" |
| Gamificação | 92 selos $ | 80 marcos ($) | XP/níveis/troféus | selos | — | conquistas $ | — | — | conquistas |
| Comunidade | chat $ | ✔ aberto | iOS $ | compartilhar | buddies | buddies + fórum | vozes de pares | — | — |
| Exportação de dados | solicitação por e-mail | ✔ (2026) | link p/ profissional | — | — | — | — | JSON + backups locais | CSV + PDF |
| Sem conta | não | sim (sem backup) | não | sim | trial exige pagamento (T) | ? | anônimo | ✔ | — |
| Offline declarado | — | — | — (T: sim) | ✔ (T) | — | — | n/a | ✔ offline-first | — |
| Privacidade (rótulo Apple) | saúde+localização vinculadas | rastreio p/ anúncios | ID+uso vinculados | não vinculado | rastreio | não vinculado | n/a | nenhum dado sai | — |
| Preço BR (30/10/2026) | até R$1.499,90 | R$13,90–229,90 | R$112,90/ano | grátis | até R$499,90 | R$409,90/ano | grátis (EUA) | grátis | — |
| Evidência RCT com abstinência | sim, ITT nulo | não | não | não | não | não | sim (2 RCTs) | n/a | n/a |

---

## 5. Onde os concorrentes são melhores que o ZERO

1. **Acesso ao alívio.** Kwit abre cartas com um gesto de sacudir; Quit Vaping (Kopp) e os apps novos de vape colocam respiração com um toque; Smoke Free Forever anuncia widget de SOS na tela bloqueada ([AppsHunter](https://appshunter.io/ios/app/smoke-free-forever/id1535376960)). O ZERO prevê botão grande no dashboard, mas o fluxo começa por formulário.
2. **Mensagens no tempo certo.** quitSTART entrega dica no mesmo horário/lugar da fissura anterior; This is Quitting tem cadência diária validada; Kwit tem lembrete de adesivo. O ZERO só mostra lembretes ao abrir; o guia de Atalhos está na V2.
3. **Suporte à farmacoterapia.** Kwit registra adesivos/gomas por unidade com programa diário; Smoke Free tem clínicas sobre medicação; NICORETTE registra doses por NFC. O ZERO só declara NRT no onboarding, sem orientação de dose nem lembretes — e esse é o alavancador com maior evidência (OR 1,79 para app + farmacoterapia).
4. **Preparação antes da data.** Kwit tem programa de 9 passos com Fagerström/Horn; This is Quitting dá 4 semanas de mensagens a quem "ainda não está pronto". O ZERO tem `not_started` no domínio, mas sem conteúdo de preparação.
5. **Lapso sem punição.** Kwit (energia cai, progresso fica), Smoke Free (histórico preservado), "modo suave" dos apps novos. O ZERO zera a sequência exibida automaticamente.
6. **Unidade de vape.** Puff Count, PuffFree e Kopp têm puffs, pods, mL e mg com conversão; o ZERO conta "unidades" genéricas, o que empobrece o registro de lapso de vape.
7. **Contexto de fissura (Smoke Free):** com quem, fazendo o quê, sentindo o quê. O ZERO captura só `trigger`; dois campos opcionais a mais (atividade, companhia) valem mais que um mapa de localização.

---

## 6. Funcionalidades desnecessárias para um app pessoal

Conta/login e sincronização em nuvem (causa das reclamações de "estatísticas zeradas" no Kwit e "usuário não existe" no QuitNow!); níveis de assinatura, trials, códigos promocionais e anúncios; comunidade, buddies, fórum e moderação (denúncia, bloqueio); Mural da Fama, certificados e compartilhamento social; chat com conselheiros humanos e sessões ao vivo; 28 idiomas; app nativo de Apple Watch (sem API web); perguntas de avaliação na loja; "troféu por permitir notificação"; programa B2B; mapa de fissuras por geolocalização (dado sensível sem valor para um único usuário que já sabe onde fuma); integração com seguradoras/Wellhub. Nenhum desses itens tem evidência de cessação; todos existem por monetização, escala ou retenção.

---

## 7. Análise de UX/UI e princípios de design transferíveis

**Padrões observados.** Todos convergem para a mesma fórmula de painel (tempo + dinheiro + unidades evitadas + linha do tempo + selos), e a densidade é falha compartilhada em Kwit, Smoke Free e QuitNow! ([ScreensDesign](https://screensdesign.com/showcase/quit-smoking-for-good-kwit), Terceiros). O timer até o segundo é dispositivo de retenção, sem base em evidência; o plano do ZERO prevê "dias/h/min/s" e deve cortar os segundos.

**Referências premium.** WHOOP: três camadas (número único → tendência → detalhe) em telas separadas, tipografia grande, fundo quase preto com paleta semântica pequena ([925 Studios](https://www.925studios.co/blog/whoop-design-breakdown), Terceiros). Oura (2024–25): de cinco abas para três, um destaque diário, tendências relativas à linha de base pessoal ([Oura](https://ouraring.com/blog/new-oura-app-experience/)). Apple HIG: não imitar os anéis de Atividade; permissões em contexto; respeitar Reduzir Movimento ([HIG HealthKit](https://developer.apple.com/design/human-interface-guidelines/healthkit.md)).

**Princípios aplicáveis ao ZERO (sem copiar texto ou imagem):**

1. **Intervenção antes de captura.** Primeira tela do SOS = cronômetro + respiração, não formulário.
2. **Um número de manchete por tela.** "Agora", "Tendências", "Histórico/Saúde". Três telas, sem acordeões.
3. **Número principal que não pune:** dias acumulados + recorde; sequência atual menor.
4. **Tendência relativa a si mesmo:** "esta semana vs. sua primeira semana", não contagem absoluta.
5. **Dark-first com um acento calmo** para o SOS; nunca vermelho de alarme na tela de fissura.
6. **Onboarding ≤ 10 telas**, sem conta, com "ainda não parei"; permissões em contexto, nunca "subornadas" com troféu.
7. **Reduzir Movimento com fallback real:** a respiração pulsante é exatamente o movimento que a configuração suprime; manter contagem numérica + texto. O `MotionSafe` do plano cobre isso se a respiração tiver versão estática.
8. **Dynamic Type e alvos de 44 pt**; só QuitNow! declara acessibilidade; Kwit não declara nada.
9. **Medir a coisa certa:** tempo desde a parada, não desde a instalação.
10. **Zero interrupções no caminho de alívio**, incluindo o banner de backup.

---

## 8. Eficácia real por funcionalidade

Classificação: **(a)** evidência clínica de benefício em abstinência ≥ 6 meses; **(b)** evidência limitada/mista (curto prazo, pequena, financiada pela indústria, só engajamento ou alívio agudo); **(c)** motivacional, sem eficácia demonstrada. Quase nenhum ensaio isola uma funcionalidade; classificações vêm de meta-análise de componentes, ensaios "completo vs. reduzido" e ausência de evidência.

| Funcionalidade | Classe | Evidência-chave |
|---|---|---|
| Mensagens automáticas agendadas (SMS) | (a) | RR 1,54 (IC 1,19–2,00), certeza moderada ([Cochrane 2019](https://pubmed.ncbi.nlm.nih.gov/31638271/)); Text2Quit verificado bioquimicamente RR 2,22 ([GWU](https://hsrc.himmelfarb.gwu.edu/sphhs_prev_facpubs/95/)); vape RR 1,32, certeza baixa ([Cochrane 2025](https://pubmed.ncbi.nlm.nih.gov/41288132/)). Push in-app nunca foi testado contra SMS. |
| Suporte à farmacoterapia/NRT | (a) | App + farmacoterapia OR 1,79 ([Guo 2023](https://pubmed.ncbi.nlm.nih.gov/37079352/)); combinação farmacoterapia + comportamental RR 1,83 ([Stead 2016](https://pubmed.ncbi.nlm.nih.gov/27009521/)); PCDT/INCA: TRN combinada (adesivo + goma/pastilha "em momentos de fissura (SOS)") ([Nota Técnica INCA 2025](https://prefeitura.poa.br/sites/default/files/usu_doc/hotsites/sms/bvaps-biblioteca-virtual-de-atencao-primaria-saude/Nota%20T%C3%A9cnica%20-%20Tratamento%20-%20Cigarros%20Eletr%C3%B4nicos%20-%202025.pdf)). |
| Aconselhamento humano; incentivos financeiros | (a) | OR 1,44 e OR 1,46, alta certeza ([Hartmann-Boyce 2021](https://pubmed.ncbi.nlm.nih.gov/33411338/)). Não entregáveis por um app pessoal; o app pode encaminhar à UBS/SUS. |
| Conteúdo ACT / "surfar a vontade" | (b) | iCanQuit vs. QuitGuide OR 1,49 aos 12 meses ([Fred Hutch](https://www.fredhutch.org/en/news/releases/2020/09/fred-hutch-led-clinical-trial-shows-new-smartphone-app-helps-smokers-quit.html)); mas Cochrane mindfulness RR 0,99 ([Jackson 2022](https://pubmed.ncbi.nlm.nih.gov/35420700/)). |
| Missões/lições TCC | (b) | Smoke Free aOR 1,90 com 8,5% de follow-up ([PMC6347038](https://pmc.ncbi.nlm.nih.gov/articles/PMC6347038)); Quit Genius RR 1,71 (indústria, com coach + NRT) ([PMC9597001](https://pmc.ncbi.nlm.nih.gov/articles/PMC9597001)). |
| Respiração guiada / exercício breve | (b) agudo | Exercício: SMD ≈ −2 na vontade, sem efeito em abstinência (RR 1,08) ([Ussher 2019](https://pubmed.ncbi.nlm.nih.gov/31684691/)); respiração: redução aguda em laboratório ([Shahab 2013](https://link.springer.com/doi/10.1007/s00213-012-2876-9)). |
| Chatbot / IA conversacional | (b) | OR 1,66 com viés de publicação; QuitBot em escala: OR 0,96 vs. SmokefreeTXT ([NCT04308759](https://clinicaltrials.gov/study/NCT04308759)). |
| Personalização/tailoring; JITAI | (b) | Tailored RR 1,10 ([Taylor 2017](https://pubmed.ncbi.nlm.nih.gov/28869775/)); JITAI "evidência de eficácia faltando" ([Perski 2022](https://pubmed.ncbi.nlm.nih.gov/34514668/)); Quit Sense aOR 4,57 em viabilidade. |
| Gamificação, selos, sequências | (b) curto prazo | RR 1,37 ≥ 6 meses de ensaios pequenos com assimetria de funil ([PMC12199787](https://pmc.ncbi.nlm.nih.gov/articles/PMC12199787/)); Inner Dragon: abstinência inconclusiva. Engajamento ≠ abstinência. |
| Comunidade/pares | (b) pilotos | WhatsApp n=42; Tobacco Status Project n=500. Pequenos. |
| Redução gradual vs. abrupta | (a) equivalência / sem evidência em vape | RR 1,01 em fumantes ([Lindson 2019](https://pubmed.ncbi.nlm.nih.gov/31565800/)); vape: 1 estudo, n=17; coorte sugere compensação de volume ao baixar mg/mL. |
| Treino de prevenção de recaída | sem benefício | RR 0,98 ([Livingstone-Banks 2019](https://pubmed.ncbi.nlm.nih.gov/31684681/)). |
| Contadores, dinheiro economizado, linha do tempo, diário, gatilhos, água, distração | (c) | Nenhum ensaio isola; "conteúdo motivacional" com intervalo incluindo nenhum efeito ([Hartmann-Boyce 2021](https://pubmed.ncbi.nlm.nih.gov/33411338/)); CDC publica a linha do tempo padrão ([CDC](https://www.cdc.gov/tobacco/about/benefits-of-quitting.html)). |
| Mensagem não julgadora após lapso | (c) para o app; (b) teoria | Autoeficácia pós-lapso prevê progressão; sem RCT de mensagem em app ([PMC3296289](https://pmc.ncbi.nlm.nih.gov/articles/PMC3296289)). |
| "A fissura dura 3–5 minutos" | Não verificado | NHS e Smokefree.gov não dão minutos; fontes de consumo divergem (3–5 vs. 15–20) ([NHS](https://www.nhs.uk/better-health/quit-smoking/staying-smoke-free/managing-nicotine-withdrawal-symptoms)). Um cronômetro de 5 min é decisão de design, não constante científica. |

---

## 9. Ranking dos cinco melhores concorrentes como referência

1. **Kwit** — a referência de produto mais próxima do ZERO: ledger de NRT/vape com custos descontados, ciclo antes/depois na fissura, estatística por estratégia, lapso sem apagar progresso, comitê científico nomeado, PT-BR e preço brasileiro. Falhas a evitar: onboarding de 27 passos, paywall sobre respiração e cartas, densidade do painel, conta obrigatória.
2. **This is Quitting** — a referência de conteúdo e cadência: único programa digital de vape com dois RCTs; estrutura (pré-data, pós-data, "não estou pronto", palavras-chave SLIP/COPE/STRESS) é copiável como calendário de mensagens sem backend.
3. **Smoke Free** — referência de registro de fissura (campos de contexto), de política "mudar data mantém histórico" e de transparência científica (publica até o ensaio nulo). Evitar: 10 SKUs, ferramentas comportamentais pagas, coleta de localização.
4. **quitSTART** — referência de app público sem conta, sem anúncio e offline, e da única mecânica contextual barata (dica no mesmo horário/lugar da fissura anterior). Evitar: contador desde a instalação, jogos quebrados.
5. **Quit Vaping (Kopp)** — referência de arquitetura dupla (sequência grátis + plano de redução) e de rastreadores por unidade de vape, com rótulo de privacidade limpo. Evitar: botão "quebrar sequência".

QuitNow! fica fora por valor concentrado em comunidade e anúncios; Puff Count, por paywall total e ausência de SOS.

---

## 10. Dez melhorias recomendadas para o ZERO

Escalas: impacto (alto/médio/baixo, pela seção 8); evidência (a/b/c); complexidade (baixa/média/alta); custo (R$ 0 em todas — PWA sem backend); prioridade (P1 > P3); fase (V1-ajuste / V2 / futuro).

| # | Melhoria | Impacto | Evidência | Complexidade | Custo | Prioridade | Fase |
|---|---|---|---|---|---|---|---|
| 1 | **SOS invertido:** abrir em cronômetro + respiração; intensidade com 1 toque na saída; gatilho/atividade/companhia opcionais depois | Médio | (b) agudo | Baixa (reordenar o `cravingReducer`) | 0 | P1 | V1-ajuste |
| 2 | **Programa de mensagens por data de parada:** 7 dias antes + 56+ dias depois + modo "ainda não pronto"; mensagem do dia no app; automação do Atalhos abre `?open=today` em horário fixo; `.ics` com os marcos | Alto | (a) para SMS; push in-app não testado | Média (conteúdo + agenda + guia de Atalhos) | 0 | P1 | V2 (antecipar para logo após a V1) |
| 3 | **Módulo NRT/farmacoterapia:** registro de doses (adesivo, goma, pastilha), mg/dia, lembrete de adesivo via Atalhos, orientação do PCDT/INCA com encaminhamento a UBS/Disque 136; rotular "não substitui prescrição" | Alto | (a) | Média | 0 | P1 | V2 |
| 4 | **Política de contador:** manchete = dias acumulados + recorde; sequência atual secundária; sem segundos | Médio (teoria da autoeficácia) | (c)/(b) teoria | Baixa | 0 | P1 | V1-ajuste |
| 5 | **Fluxo pós-lapso protetor:** após "fumei" no SOS, tela "o que fazer agora" (próxima hora, estratégia com melhor histórico, lembrar motivos), sem painel zerado; sugestão de recaída só após 2 lapsos/72 h (já previsto) | Médio | (b) teoria | Baixa | 0 | P1 | V1-ajuste |
| 6 | **Acesso 0–1 toque ao SOS:** deep link `?open=sos` em Atalho na Tela de Início/bloqueio; botão de largura total; sem card de backup no caminho | Médio | (c) UX | Baixa | 0 | P2 | V1-ajuste |
| 7 | **Onboarding ≤ 10 telas com "ainda não parei":** data futura de primeira classe, estado de preparação com conteúdo; Fagerström opcional, rotulado "não validado para vape" ([INCA 2025](https://prefeitura.poa.br/sites/default/files/usu_doc/hotsites/sms/bvaps-biblioteca-virtual-de-atencao-primaria-saude/Nota%20T%C3%A9cnica%20-%20Tratamento%20-%20Cigarros%20Eletr%C3%B4nicos%20-%202025.pdf)) | Médio | (b) diretriz | Baixa | 0 | P2 | V1-ajuste |
| 8 | **Lembretes contextuais por horário** derivados de `analyzePatterns` (n ≥ 15): sugerir ao usuário criar automação do Atalhos nos horários de pico | Médio | (b) JITAI | Média | 0 | P2 | V2 |
| 9 | **Perfil por produto de vape** (mg/mL, puffs por pod) com mg como moeda comum; lapso registra puffs/pod e mg, não só "unidades" | Baixo–médio | sem evidência (lacuna do mercado) | Média | 0 | P3 | V2 |
| 10 | **Teste de restauração + exportação automatizada:** botão "testar restauração" que valida o último JSON; Atalho que abre `?open=backup` a cada 14 dias | Indireto (evita perda total) | (c) | Baixa | 0 | P1 | V1-ajuste |

Nenhuma das dez exige backend, API paga ou conta. Web Push continua incompatível (precisa de servidor); a alternativa gratuita é o Atalhos, cujo comportamento no iOS 27 deve ser testado no aparelho real (**Não verificado** nas notas).

---

## 11. Cinco funcionalidades que não vale a pena implementar

1. **Comunidade, buddies, fórum.** Exige backend e moderação; evidência só de pilotos; o feed é descrito como "gatilho" quando outros falam de fissuras ([180habits](https://180hab.pages.dev/quit-smoking/best-apps/), Terceiros). **Incompatível** com o ZERO.
2. **Chatbot generativo.** O QuitBot em escala não superou SMS (OR 0,96); API externa é paga; WebLLM derruba a página. O coach por regras rotulado "não IA" é a decisão correta.
3. **Gamificação pesada (XP, níveis, 84–92 troféus, mascote, troféu por permissão).** Engajamento sem abstinência comprovada; criticada como paternalista na abstinência aguda. Conquistas sóbrias por marcos (V2) bastam.
4. **Contador até o segundo e "tempo de vida recuperado" sem fonte.** O primeiro existe para fazer reabrir o app; o segundo (QuitNow!: 6 min/cigarro) não tem fórmula publicada e expõe o app a disputa de acurácia.
5. **Módulo de redução gradual por mg/mL ou limite diário decrescente de puffs.** Redução = abrupto em fumantes (RR 1,01); em vape, nenhum ensaio concluído e coorte sugere compensação de volume; descartáveis (mercado brasileiro) não têm concentração menor. Um registro simples de consumo pré-parada para consciência ("o número me acordou") resolve 80% do valor sem o módulo.

Também fora: mapa de fissuras por localização, Apple Watch, integrações de saúde (sem API web), sessões ao vivo.

---

## 12. Oportunidades de diferenciação

1. **Quatro trilhas de abstinência com estado de NRT** — único no mercado; comunicar na tela "sem vape há X / em reposição de nicotina" como dois fatos separados. Ninguém, nem Kwit, mostra "vape-free" e "nicotine-free" como estados distintos.
2. **Lapso com quantidade e sequência preservada no histórico** — apps de redução perdem o evento; apps de abstinência perdem a quantidade; o ZERO pode ter os dois (evento imutável + `totalFree` + `episodes[]`).
3. **Honestidade de evidência na própria interface:** rótulo `strong/moderate/limited` por marco e banner "dados de cigarro; evidência para vape limitada" (já na V2). Só o emkapps aproxima isso com um disclaimer; QuitNow! e Kwit sofrem com acurácia contestada.
4. **Zero monetização no caminho de alívio** — a reclamação nº 1 da categoria, eliminada por construção.
5. **Estatística de estratégia descritiva com limiar de amostra** (n ≥ 10, "nos seus registros"): Kwit mostra a estatística sem limiar; Smoke Free cobra por ela.
6. **Alinhamento ao SUS:** orientação do PCDT, encaminhamento à UBS, Disque Saúde 136. Nenhum app analisado menciona o sistema brasileiro.
7. **Privacidade absoluta** (nenhum dado sai do aparelho) contra rótulos que vinculam saúde, localização e compras à identidade (Smoke Free) ou rastreiam para anúncios (QuitNow!, Puff Count).

---

## 13. Recomendações para o botão SOS

- **Entrada:** botão de largura total no topo da tela "Agora" + Atalho com deep link `?open=sos` na Tela de Início/bloqueio. Nada entre o toque e o cronômetro.
- **Primeira tela:** cronômetro já correndo (3–5 min como escolha de design; o texto diz "vontades são temporárias e passam em minutos", sem afirmar "3–5 minutos" como fato) + respiração guiada com contagem numérica e texto; versão estática quando Reduzir Movimento estiver ativo. Um toque opcional "intensidade agora" (0–10) no início; nunca obrigatório.
- **Durante:** botão "Como está agora?" (já previsto) permanece opcional; sugerir primeiro a estratégia com melhor histórico quando n ≥ 10 (já previsto); alternativas em uma linha de chips (água, caminhar, mudar de ambiente, motivos). Se NRT ativa no perfil, mostrar "goma/pastilha de SOS" como estratégia, citando o PCDT.
- **Saída:** dois botões — "Passou" / "Fumei". Em "Passou": um toque de intensidade final, chips opcionais de gatilho, atividade, companhia; fim. Em "Fumei": ir direto ao fluxo de lapso protetor (seção 10, item 5), com produto e quantidade; nunca mostrar o contador zerado como primeira coisa.
- **Nunca no SOS:** banner de backup, pedido de permissão, card de instalação, conquista desbloqueada, animação de celebração.
- **Vibração háptica** para ritmar a respiração de olhos fechados seria diferencial, mas a API de vibração não existe no Safari do iOS (limitação conhecida da plataforma, fora das notas); manter som opcional e contagem visual.
- **Medir:** `durationSec`, `ratings[]`, `outcome`; alimentar `strategyEffectiveness` e `analyzePatterns`. Texto sempre descritivo, nunca causal.

---

## 14. Recomendações de design e experiência mobile

- **Três telas, não sete abas:** Agora (estado das trilhas + SOS + mensagem do dia), Tendências (fissuras/semana vs. primeira semana, humor, estratégias), Histórico (episódios, lapsos, linha do tempo, exportação). Detalhe em telas separadas, sem acordeões.
- **Hierarquia tipográfica tipo WHOOP:** um número grande por tela; Inter self-hosted com escala que respeita Dynamic Type; alvos ≥ 44 pt.
- **Paleta:** dark-first, fundo quase preto, um acento calmo (verde/azul) para SOS e estado livre; âmbar para "em reposição"; cinza neutro para "em recaída"; sem vermelho de alarme.
- **Contadores:** dias (e horas no primeiro dia) sem segundos; "dias acumulados" e "recorde" como manchete; trilhas secundárias em linha compacta.
- **Linha do tempo:** lista com percentual e rótulo de evidência por item; nada de anéis estilo Atividade.
- **Onboarding:** ≤ 10 telas, todas puláveis (manter), com "ainda não parei"; pedir persistência de armazenamento e instalação em contexto (após o primeiro SOS ou diário), não na primeira abertura.
- **Instalação e backup:** card de instalação some em `standalone` (já previsto); lembrete de backup aos 14 dias fora do SOS; mostrar "último backup externo: há N dias" na tela Histórico.
- **Movimento:** toda animação com alternativa estática; a respiração é o caso crítico.
- **Tom:** sem mascote, sem seletor de emoções enviesado para o negativo (crítica ao Kwit), sem linguagem de culpa no lapso.

---

## 15. Limitações desta análise

- **Nenhum app foi executado.** Fluxos de SOS, ordem de telas do onboarding e comportamento do contador após lapso são reconstruídos de FAQs, listagens e (Kwit) de uma análise de telas de terceiros. Contagens de toques são estimativas, não medições.
- **Capturas de tela não puderam ser lidas** em nenhuma listagem (placeholders sem alt text).
- **Google Play não renderizou** para nenhum app; dados Android vêm do AppGoblin (Terceiros); preços e seções de segurança de dados do Play estão ausentes.
- **Reddit inacessível** (bloqueio ao crawler; espelho retornou 429): r/stopsmoking e r/QuitVaping não foram lidos; a pergunta "o que de fato ajudou" ficou sem fonte primária.
- **Agregadores de avaliações:** Marlvel.ai retornou 403; AppFollow expirou; JustUseApp mostra avaliações sem data. Texto de avaliações datadas de 2025–26 é escasso.
- **Cochrane Library (403), NICE (403), PCDT 2020 (404), guia completo da OMS 2024:** figuras vêm de resumos do PubMed, citações secundárias e da Nota Técnica INCA 2025. O resumo do JAMA 2024 (This is Quitting adolescentes) não foi lido diretamente.
- **Períodos de cobrança** não aparecem nas listagens; preços de Blitz Your Quit (Smoke Free) não foram encontrados.
- **Discrepâncias entre notas:** quitSTART aparece com 4,6★/2,4K (App Store) e 4,5★/38 (AppFollow); o número de troféus/níveis do Kwit vem de blog concorrente.
- **Stiftung Warentest 2024** (14 apps) existe, mas é pago e não foi lido.
- **Suporte do iOS 27 a automações do Atalhos, widgets de tela bloqueada e `navigator.storage.persist()`** não foi testado; o plano do ZERO depende disso.

---

## 16. Referências

**Lojas e sites oficiais**
- Smoke Free: [App Store US](https://apps.apple.com/us/app/smoke-free-quit-smoking-now/id577767592) · [App Store BR](https://apps.apple.com/br/app/smoke-free-quit-smoking-now/id577767592) · [site](https://smokefreeapp.com) · [FAQ](https://smokefreeapp.com/faq/) · [Práticas](https://smokefreeapp.com/practices-and-procedures/) · [Privacidade](https://smokefreeapp.com/privacy-policy/)
- QuitNow!: [App Store US](https://apps.apple.com/us/app/quitnow-stop-smoking-for-good/id483994930) · [App Store BR](https://apps.apple.com/br/app/quitnow/id483994930) · [site](https://www.quitnow.app/) · [FAQ PRO](https://www.quitnow.app/en/faq/which-are-the-pro-features) · [FAQ reset](https://www.quitnow.app/en/faq/how-to-reset-my-quit-data)
- Kwit: [App Store US](https://apps.apple.com/us/app/-/id525441365) · [App Store BR](https://apps.apple.com/br/app/parar-de-fumar-cigarros-kwit/id525441365) · [FAQ](https://info.kwit.app/en/faq) · [Base científica](https://info.kwit.app/en/medical-and-scientific-basis/scientific-basis-of-kwit) · [Pesquisas](https://info.kwit.app/en/medical-and-scientific-basis/scientific-research-papers) · [Privacidade](https://info.kwit.app/en/legal-information/privacy-policy) · [ScreensDesign (Terceiros)](https://screensdesign.com/apps/quit-smoking-for-good-kwit/)
- quitSTART: [Smokefree.gov](https://smokefree.gov/tools-tips/apps/quitstart) · [App Store US](https://apps.apple.com/us/app/quitstart-quit-smoking/id494552000) · [Healthify NZ (Terceiros)](https://healthify.nz/apps/q/quitstart-app)
- Puff Count: [App Store US](https://apps.apple.com/us/app/puff-count/id1488580640) · [App Store BR](https://apps.apple.com/br/app/puff-count/id1488580640) · [JustUseApp (Terceiros)](https://justuseapp.com/en/app/1488580640/puff-count/reviews)
- Quit Vaping (Kopp): [App Store US](https://apps.apple.com/us/app/quit-vaping/id1479615245) · [App Store BR](https://apps.apple.com/br/app/quit-vaping/id1479615245)
- This is Quitting: [Truth Initiative](https://truthinitiative.org/press/press-release/jama-publishes-new-study-proven-effectiveness-truth-initiatives-text-message) · [thetruth.com](https://thetruth.com/article/quitting-vaping)
- Secundários: [Pelago](https://apps.apple.com/us/app/pelago-health/id1234288038) · [NICORETTE UK](https://apps.apple.com/gb/app/nicorette-stop-smoke-vape/id1189131363) · [NãoPOD!](https://apps.apple.com/br/app/id6502217586) · [EasyQuit](https://apps.apple.com/us/app/easyquit-stop-smoking/id1508110799) · [PuffFree](https://apps.apple.com/us/app/id6739467990) · [Quit Vaping emkapps](https://apps.apple.com/us/app/quit-vaping/id6760400463) · [Smoke Free Forever](https://appshunter.io/ios/app/smoke-free-forever/id1535376960) · [id6756565950](https://apps.apple.com/app/id6756565950)
- Agregadores: [AppGoblin Smoke Free](https://appgoblin.info/apps/com.portablepixels.smokefree) · [AppGoblin QuitNow](https://appgoblin.info/apps/com.EAGINsoftware.dejaloYa) · [AppGoblin Kwit](https://appgoblin.info/apps/fr.kwit.android) · [JustUseApp Smoke Free](https://justuseapp.com/en/app/577767592/smoke-free-quit-smoking-now/reviews) · [JustUseApp QuitNow](https://justuseapp.com/en/app/483994930/quitnow/reviews) · [JustUseApp Kwit](https://justuseapp.com/en/app/525441365/kwit-quit-smoking-and-vaping/reviews) · [unitQ](https://www.unitq.com/unitq-scorecards/smokefree/)

**Evidência clínica**
- [Whittaker 2019, Cochrane celular](https://pubmed.ncbi.nlm.nih.gov/31638271/) · [Taylor 2017, Cochrane internet](https://pubmed.ncbi.nlm.nih.gov/28869775/) · [Hartmann-Boyce 2021, componentes](https://pubmed.ncbi.nlm.nih.gov/33411338/) · [Guo 2023, apps](https://pubmed.ncbi.nlm.nih.gov/37079352/) · [Stead 2016](https://pubmed.ncbi.nlm.nih.gov/27009521/) · [Hartmann-Boyce 2019](https://pubmed.ncbi.nlm.nih.gov/31166007/) · [Livingstone-Banks 2019, recaída](https://pubmed.ncbi.nlm.nih.gov/31684681/) · [Jackson 2022, mindfulness](https://pubmed.ncbi.nlm.nih.gov/35420700/) · [Ussher 2019, exercício](https://pubmed.ncbi.nlm.nih.gov/31684691/) · [Lindson 2019, redução](https://pubmed.ncbi.nlm.nih.gov/31565800/) · [Lindson 2023, farmacoterapia](https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD015226.pub2/pdf/CDSR/CD015226/CD015226_abstract.pdf) · [Butler 2025, Cochrane vape](https://pubmed.ncbi.nlm.nih.gov/41288132/)
- [Crane 2018/19, Smoke Free](https://pmc.ncbi.nlm.nih.gov/articles/PMC6347038) · [Perski 2019, chatbot](https://pmc.ncbi.nlm.nih.gov/articles/PMC6775545) · [Jackson 2024, ASSET](https://pubmed.ncbi.nlm.nih.gov/39546331/) · [Inner Dragon 2024](https://jmir.org/2024/1/e57839) · [Bricker 2020, iCanQuit](https://www.fredhutch.org/en/news/releases/2020/09/fred-hutch-led-clinical-trial-shows-new-smartphone-app-helps-smokers-quit.html) · [Quit Genius 2020](https://pubmed.ncbi.nlm.nih.gov/33021488/) · [Quit Genius 52 sem](https://pmc.ncbi.nlm.nih.gov/articles/PMC9597001) · [Graham 2021, This is Quitting](https://pubmed.ncbi.nlm.nih.gov/33999133/) · [NCT04919590](https://clinicaltrials.gov/study/NCT04919590) · [Text2Quit](https://hsrc.himmelfarb.gwu.edu/sphhs_prev_facpubs/95/) · [QuitBot NCT04308759](https://clinicaltrials.gov/study/NCT04308759) · [Quit Sense](https://nottingham-repository.worktribe.com/output/34345907/a-smoking-cessation-smartphone-app-that-delivers-real-time-context-aware-behavioural-support-the-quit-sense-feasibility-rct) · [Wiseman 2025, quitSTART](https://www.jmir.org/2025/1/e67630) · [Kwit JMIR mHealth 2024](https://pubmed.ncbi.nlm.nih.gov/?term=Feasibility+and+Engagement+of+a+Mobile+App+Preparation+Program+%28Kwit%29+for+Smoking+Cessation)
- [Perski 2022, JITAI](https://pubmed.ncbi.nlm.nih.gov/34514668/) · [Gamificação 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12199787/) · [Shahab 2013, respiração](https://link.springer.com/doi/10.1007/s00213-012-2876-9) · [Exercício agudo](https://researchportal.plymouth.ac.uk/en/publications/the-acute-effects-of-physical-activity-on-cigarette-cravings-syst-2) · [Lapsos, PMC3296289](https://pmc.ncbi.nlm.nih.gov/articles/PMC3296289)

**Diretrizes**
- [OMS 2024, guia de cessação](https://www.who.int/news/item/02-07-2024-who-releases-first-ever-clinical-treatment-guideline-for-tobacco-cessation-in-adults) · [OMS, e-cigarros](https://www.who.int/news-room/questions-and-answers/item/tobacco-e-cigarettes) · [OMS, avaliação de apps](https://www.who.int/initiatives/tobacco-cessation-consortium/tobacco-cessation-mobile-app-assessment) · [USPSTF 2021](https://www.uspreventiveservicestaskforce.org/uspstf/index.php/recommendation/tobacco-use-in-adults-and-pregnant-women-counseling-and-interventions) · [USPHS 2008](https://pmc.ncbi.nlm.nih.gov/articles/PMC4465757/) · [CDC, benefícios](https://www.cdc.gov/tobacco/about/benefits-of-quitting.html) · [NHS, abstinência](https://www.nhs.uk/better-health/quit-smoking/staying-smoke-free/managing-nicotine-withdrawal-symptoms) · [Smokefree.gov, fissuras](https://smokefree.gov/challenges-when-quitting/cravings-triggers/how-manage-cravings) · [NICE NG209 via NCSCT](https://www.ncsct.co.uk/publications/Guidance_NG209) · [INCA PNCT](https://www.gov.br/inca/pt-br/assuntos/gestor-e-profissional-de-saude/programa-nacional-de-controle-do-tabagismo) · [Nota Técnica INCA 2025, cigarros eletrônicos](https://prefeitura.poa.br/sites/default/files/usu_doc/hotsites/sms/bvaps-biblioteca-virtual-de-atencao-primaria-saude/Nota%20T%C3%A9cnica%20-%20Tratamento%20-%20Cigarros%20Eletr%C3%B4nicos%20-%202025.pdf) · [Prefeitura SP, tabagismo](https://prefeitura.sp.gov.br/web/saude/w/tabagismo)

**Design**
- [925 Studios, WHOOP](https://www.925studios.co/blog/whoop-design-breakdown) · [Oura 2024](https://ouraring.com/blog/new-oura-app-experience/) · [Oura 2025](https://ouraring.com/blog/new-app-design/) · [Apple HIG HealthKit](https://developer.apple.com/design/human-interface-guidelines/healthkit.md) · [180habits (Terceiros)](https://180hab.pages.dev/quit-smoking/best-apps/) · [heycravo (concorrente)](https://heycravo.com/blog/smoke-free-vs-kwit-vs-quitsure/)
