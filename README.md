# ZERO

Assistente pessoal para parar de fumar (cigarro, vape/pod, tabaco e nicotina). PWA offline-first, dados só no aparelho, custo zero.

- **App:** https://dudumattar.github.io/zero/
- **Uso pessoal.** Sem conta, sem servidor, sem anúncios, sem IA paga.

## O que a V1 faz

- **Onboarding** em 10 telas, todas puláveis (produtos, consumo e preço, história, gatilhos, motivos, data de parada já realizada ou futura, reposição de nicotina, metas).
- **Painel "Agora":** botão de SOS no topo; manchete = **dias livres acumulados** + **recorde** (sem segundos correndo); sequência atual como dado secundário; próximo marco; quatro trilhas separadas: sem tabaco ou vape (geral), sem cigarro, sem vape, sem nicotina (com estado "em reposição de nicotina" enquanto houver NRT); economia, unidades não consumidas, vontades superadas, humor e sono dos últimos 7 dias; motivos; estado "em recaída" e "preparação" quando for o caso.
- **SOS invertido:** abre direto no cronômetro com respiração guiada (4‑4‑6). Estratégias: respirar, adiar, observar, água, caminhar, mudar de ambiente, motivos. "Como está agora?" registra avaliações intermediárias; "+1 min" estende. Na saída: intensidade com um toque, gatilho opcional, "Passou" ou "Fumei". Quando há 10 ou mais registros de uma estratégia, a de maior queda média aparece primeiro, com texto descritivo, nunca causal.
- **Lapsos e recaídas:** lapso (produto, nicotina ou 0 mg, quantidade, quando, gatilho, sentimento, o que aconteceu, o que pode ser diferente); recaída; novo ponto de partida. Depois de um lapso, tela protetora com o que fazer na próxima hora; nunca um painel zerado.
- **Diário** em menos de um minuto (6 escalas de 1 a 5, vontade de 0 a 10, atividade física, sintomas, texto).
- **Histórico** por dia com filtros, episódios de abstinência e remoção de registro feito por engano (até 24 h).
- **Ajustes:** tema, movimento reduzido, duração do SOS, consumo e preço (vale daqui para a frente), correção da data inicial, fim da reposição de nicotina, motivos, estado do armazenamento, apagar tudo.
- **Backups:** exportação externa em JSON com checksum SHA‑256 (no iPhone, "Salvar em Arquivos → iCloud Drive"); importação com validação, pré-visualização, mesclar ou substituir; "testar restauração" sem alterar nada; snapshots locais automáticos (1×/dia, mantém 7) e manuais, com aviso de que não protegem contra exclusão pelo iOS.

## Regras de contagem

- Produtos têm classe: combustão (cigarro, enrolado, charuto), vape, tabaco aquecido, oral (sachê), NRT.
- **Qualquer consumo de produto fumado ou vaporizado** encerra a trilha geral e a trilha da classe; se tinha nicotina, encerra também a trilha de nicotina. Sachê encerra só a nicotina. Vape 0 mg encerra vape e geral, não nicotina.
- **Lapso:** a trilha afetada reinicia no instante do lapso. **Recaída:** trilhas param até um novo ponto de partida. Em nenhum caso o total acumulado, o recorde ou os episódios são reduzidos.
- Total acumulado = soma de intervalos efetivamente livres, sem sobreposição; o período em recaída fica fora.
- NRT declarada não é lapso; a trilha de nicotina começa quando a reposição termina.

## Limitações (de propósito e de plataforma)

- **Sem notificações em segundo plano.** Web Push no iPhone exige servidor. Alternativa gratuita: automação no app **Atalhos** abrindo `https://dudumattar.github.io/zero/?open=sos` (ou `?open=diario`, `?open=backup`).
- **Sem IA.** Sugestões são regras sobre os seus registros. A interface do "coach" está preparada para um adaptador futuro, não conectado.
- **Sem integrações de saúde** (Apple Health, Garmin, WHOOP): não há API web.
- **Dados podem ser apagados pelo iOS** em site sem uso por 7 dias; instalado na tela de início o risco cai, mas não some. `navigator.storage.persist()` é pedido a cada abertura e o resultado é mostrado em Ajustes, sem tratar isso como garantia. O backup externo é o que protege.
- O app **não diagnostica, não prescreve e não substitui profissional de saúde**. No SUS o tratamento é gratuito (UBS, Disque 136).

## Instalar no iPhone

1. Abra o link no Safari.
2. Compartilhar → **Adicionar à Tela de Início** → Adicionar.
3. Abra sempre pelo ícone. O app instalado e o Safari têm armazenamentos separados; para migrar dados, exporte um backup num e importe no outro.

## Desenvolvimento

```bash
npm install
npm run dev          # http://localhost:5173
npm test -- --run    # Vitest (domínio)
npm run test:e2e     # Playwright (iPhone 13, Chrome)
npm run build && npm run preview
```

Stack: React 19, TypeScript, Vite, Tailwind v4, Dexie (IndexedDB), vite-plugin-pwa, react-router (hash), zod, Vitest, Playwright. Deploy: GitHub Actions → GitHub Pages (`VITE_BASE=/zero/`).

Estrutura: `src/domain` (puro, sem React/Dexie), `src/data` (Dexie, repositórios, backup), `src/features/*` (telas), `src/ui` (componentes), `src/content` (textos e catálogos). Progresso e pendências em [docs/PROGRESS.md](docs/PROGRESS.md); benchmarking em [docs/BENCHMARKING.md](docs/BENCHMARKING.md).
