# Fontes da linha do tempo de recuperação

Verificação feita em 30/10/2026 abrindo as páginas oficiais. Texto do app em `src/content/timeline.pt-BR.ts`.

## Páginas usadas
- NHS, cronologia: https://www.nhs.uk/better-health/quit-smoking/ready-to-quit-smoking/what-could-happen-when-you-quit-smoking/
- NHS, benefícios: https://www.nhs.uk/better-health/quit-smoking/why-quit-smoking/benefits-of-quitting-smoking/
- NHS, abstinência: https://www.nhs.uk/better-health/quit-smoking/staying-smoke-free/managing-nicotine-withdrawal-symptoms/
- CDC, benefícios (tabela atualizada em 15/05/2024): https://www.cdc.gov/tobacco/about/benefits-of-quitting.html
- INCA, tratamento (seção "Benefícios"): https://www.gov.br/inca/pt-br/assuntos/gestor-e-profissional-de-saude/programa-nacional-de-controle-do-tabagismo/tratamento
- OMS, vape: https://www.who.int/news-room/questions-and-answers/item/how-to-quit-e-cigarettes

## Divergências e decisões
| Marco | Divergência | Decisão no app |
|---|---|---|
| 20 min | CDC atual diz só "minutos"; NHS e INCA mantêm 20 min | Usar NHS/INCA, evidência **moderada** |
| Nicotina zero | INCA: 2 h; CDC: 24 h | Marco de 24 h cita as duas; foco no pico de abstinência (NHS) |
| 72 h | Só o NHS cita | Evidência **limitada** |
| Circulação | INCA 3 semanas; NHS 2–12 semanas | Marco em 3 semanas citando ambos |
| Tosse/falta de ar | NHS 3–9 meses; CDC 1–12 meses | Marco em 9 meses com a faixa no texto |
| 1 ano | NHS e INCA: "metade"; CDC abandonou a formulação | Citar NHS/INCA, evidência **moderada** |
| AVC | CDC: 5–10 anos (não 2–5) | Incluído no marco de 5 anos |
| 15 anos | INCA diz 10 anos | Texto cita a divergência |

## Não encontrado em fonte oficial (fora do app)
Terminações nervosas em 48 h; marco de 1–2 semanas; cílios; AVC em 2–5 anos; bexiga pela metade em 5 anos; colo do útero em 5 anos; qualquer percentual de "pulmão recuperado".

## Vape
Nenhuma das páginas oficiais abertas traz cronologia de recuperação para quem usa só vape. OMS (2021): "The scientific evidence on e-cigarettes as cessation aids is inconclusive". CDC: "More research is needed to better understand the short- and long-term health effects of using e-cigarettes." Por isso o app marca os marcos como "cigarro" e mostra aviso para quem usava só vape. O marco de 24 h (nicotina e abstinência) aplica-se aos dois.

## Abstinência (para mensagens e SOS)
- Início em poucas horas; pico na primeira semana, sobretudo nos 3 primeiros dias (NHS).
- Duração média 3–4 semanas (NHS); INCA: 1–2 semanas, até 4. O app usa "3 a 4 semanas" com "tende a".
- Fissura: INCA diz "geralmente não dura mais que 5 minutos"; CDC: "it will always pass". O app não afirma minutos como fato.
