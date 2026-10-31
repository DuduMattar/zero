// Mensagem do dia, ancorada na data de parada. Dia −7 a 90; depois, semanal.
// Tom: direto, sem clichê, sem culpa. Uma ideia por dia, ≤ 2 frases.

export interface DayMessage {
  day: number;
  title: string;
  body: string;
  /** ação curta e opcional (≤ 2 min) */
  action?: string;
}

export const MESSAGES: readonly DayMessage[] = [
  // Preparação
  { day: -7, title: 'Uma semana para o dia zero', body: 'Não precisa parar hoje. Precisa só observar: quando, onde e com quem você fuma. Isso vira o seu mapa.', action: 'Anote os 3 momentos em que você mais fuma.' },
  { day: -6, title: 'O que vai no lugar?', body: 'Cada cigarro ocupa uma pausa, um gesto, um intervalo. Decida agora o que entra nesses buracos: água, um passo lá fora, uma mensagem para alguém.', action: 'Escolha um substituto para a pausa do café.' },
  { day: -5, title: 'Conte para uma pessoa', body: 'Alguém de confiança sabendo da sua decisão facilita pedir ajuda no momento ruim. Escolha quem não vai fazer piada.', action: 'Mande uma mensagem: "Vou parar no dia X."' },
  { day: -4, title: 'Reposição de nicotina não é trapaça', body: 'Adesivo, goma e pastilha dobram a chance de sucesso em estudos grandes. No SUS, é gratuito pela UBS. Vale perguntar.', action: 'Veja se a UBS mais perto tem tratamento para tabagismo.' },
  { day: -3, title: 'Limpe o ambiente', body: 'Isqueiro, cinzeiro, pod reserva, o maço "de emergência". O que fica à mão facilita o consumo por impulso.', action: 'Jogue fora o que sobrou. Hoje.' },
  { day: -2, title: 'O plano para a primeira vontade', body: 'Ela vai vir. Decida agora o que você faz: abrir o SOS, respirar 3 minutos, beber água, sair do lugar. Ter a resposta pronta evita decidir no meio da vontade.', action: 'Abra o SOS uma vez só para conhecer.' },
  { day: -1, title: 'Amanhã', body: 'Durma cedo. Tire da agenda de amanhã o que for evitável: bar, festa, reunião tensa. O primeiro dia merece ser simples.', action: 'Deixe água na cabeceira.' },
  // Fase 1: dias 1–7
  { day: 0, title: 'Dia zero', body: 'Hoje você não precisa vencer nada. Só precisa chegar até a hora de dormir sem fumar. Uma vontade de cada vez.', action: 'Quando bater, abra o SOS antes de pensar.' },
  { day: 1, title: 'As primeiras 24 horas', body: 'Se você parou a nicotina de vez, irritação, fome e inquietação podem aparecer nas primeiras 24 horas. É abstinência, não falha. Se está em reposição de nicotina, siga o plano combinado com o profissional.', action: 'Registre como você está no diário.' },
  { day: 2, title: 'O pior tende a ser agora', body: 'Entre o segundo e o terceiro dia a abstinência física costuma estar no pico. Isso não é o normal novo; é o ponto mais alto da curva.', action: 'Caminhe 10 minutos quando a vontade subir.' },
  { day: 3, title: '72 horas', body: 'Para quem fumava cigarro, respirar pode começar a ficar mais fácil. Algumas pessoas percebem nos primeiros dias; outras demoram mais.', action: 'Suba uma escada prestando atenção na respiração.' },
  { day: 4, title: 'Vontade não é ordem', body: 'Uma vontade é um sinal do corpo, como fome. Você pode sentir e não obedecer. Observe onde ela aparece: garganta, peito, mãos.', action: 'Na próxima, use "Observar" no SOS.' },
  { day: 5, title: 'Fome e sono', body: 'Comer mais e dormir pior nesta semana é comum. Priorize proteína, água e dormir no horário. Isso passa.', action: 'Prepare um lanche que não seja doce.' },
  { day: 6, title: 'Quase uma semana', body: 'Os primeiros dias são os que mais exigem atenção. Passar deles não elimina o risco, mas muda o tipo de desafio.' },
  { day: 7, title: 'Uma semana', body: 'Sete dias. A intensidade da abstinência costuma cair daqui em diante, mas sintomas ainda aparecem. O que ganha peso agora é hábito e gatilho, e isso se desmonta um por um.', action: 'Veja nas Tendências em que horas a vontade mais aparece.' },
  // Fase 2: dias 8–30
  { day: 8, title: 'Os gatilhos ficam', body: 'Café, fim do almoço, trânsito, bar. Os lugares não mudaram, você mudou. Repetir a rotina sem fumar é o que reprograma.' },
  { day: 9, title: 'A regra do "só um"', body: '"Só um" costuma ser o primeiro passo de volta ao padrão antigo. Tenha um plano para quando essa frase aparecer, porque ela vai aparecer.' },
  { day: 10, title: 'Dez dias', body: 'Paladar e olfato voltam aos poucos. Comida tem mais gosto, roupa tem menos cheiro. Pequeno, mas real.' },
  { day: 11, title: 'Dinheiro', body: 'Veja quanto já ficou no bolso. Dar um destino concreto a esse dinheiro torna o progresso visível.', action: 'Defina um objetivo em Tendências.' },
  { day: 12, title: 'Situações sociais', body: 'A primeira festa sem fumar é a mais difícil. Vá com um plano: bebida sem álcool na mão, saída combinada, SOS no bolso.' },
  { day: 13, title: 'Humor', body: 'Irritabilidade e tristeza nas primeiras semanas são comuns e passam. Se não passarem ou piorarem muito, fale com um profissional. Não é fraqueza.' },
  { day: 14, title: 'Duas semanas', body: 'Duas semanas. Para quem parou de fumar, estudos descrevem melhora da circulação por volta deste prazo. Varia de pessoa para pessoa; o que você sente é o seu dado.' },
  { day: 15, title: 'Se você já fumou de novo', body: 'Um lapso não anula duas semanas. Registrar ajuda a ver o que puxou e a planejar a próxima situação parecida. Anote e siga.' },
  { day: 16, title: 'Sono', body: 'Dormir melhor é um dos primeiros ganhos relatados. Veja no diário se o seu sono está mudando.' },
  { day: 17, title: 'Álcool', body: 'Álcool derruba a decisão e aciona o hábito ao mesmo tempo. Nas primeiras semanas, menos é mais.' },
  { day: 18, title: 'Vape também', body: 'Se o problema era pod, a lógica é a mesma: nicotina é nicotina. Os prazos de recuperação do pulmão para vape ainda não são bem conhecidos; a dependência, sim.' },
  { day: 19, title: 'Tédio', body: 'Tédio é gatilho silencioso. O cigarro ocupava tempo morto. Tenha uma lista de coisas de 5 minutos para esses buracos.', action: 'Escreva 3 coisas de 5 minutos.' },
  { day: 20, title: 'Vinte dias', body: 'Olhe o histórico: quantas vontades você já passou? Cada uma é uma prova de que elas passam.' },
  { day: 21, title: 'Três semanas', body: 'A abstinência costuma estar bem menor, mas vontades e sintomas ainda podem aparecer. A ideia de que "um cigarro resolveria" tende a voltar; ela não resolve, só reinicia o ciclo.' },
  { day: 22, title: 'Estresse', body: 'Fumar não tirava o estresse; tirava a abstinência, que você sentia como estresse. Sem nicotina, o nível de base cai com o tempo.' },
  { day: 23, title: 'Respiração', body: 'Respirar devagar por alguns minutos ajuda muita gente a baixar a tensão, na vontade e no estresse. Se der tontura, respire no seu ritmo, sem segurar.' },
  { day: 24, title: 'Identidade', body: 'Em algum momento você deixa de ser "alguém tentando parar" e vira "alguém que não fuma". Costuma acontecer sem aviso.' },
  { day: 25, title: 'Quem fuma perto', body: 'Pedir para não fumarem perto de você não é exagero. É a mesma coisa que não deixar doce na mesa de quem está de dieta.' },
  { day: 26, title: 'Tosse', body: 'Quem fumava cigarro pode notar mudança na tosse nas primeiras semanas. Se for persistente, intensa, com sangue ou vier com falta de ar ou dor no peito, procure avaliação médica.' },
  { day: 27, title: 'Energia', body: 'Compare a energia da primeira semana com a de agora no diário. O gráfico mostra o que a memória esquece.' },
  { day: 28, title: 'Quatro semanas', body: 'Um mês de hábitos novos. O que você faz no lugar do cigarro já é rotina, mesmo que ainda pareça esforço.' },
  { day: 29, title: 'Amanhã, 30', body: 'Trinta dias é um marco que muita gente não alcança. Prepare uma forma de marcar isso que não envolva fumar nem beber.' },
  { day: 30, title: 'Trinta dias', body: 'Um mês é um marco. Escolha uma situação que ainda exige cuidado e combine consigo o que fará quando ela acontecer.' },
  // Fase 3: dias 31–60
  { day: 31, title: 'Segundo mês', body: 'Agora o perigo muda de forma: deixa de ser a vontade forte e passa a ser a confiança excessiva. "Já consigo controlar." Não precisa testar.' },
  { day: 33, title: 'Lapsos tardios', body: 'Depois do primeiro mês, o risco costuma vir de situações específicas: luto, festa, viagem, briga. Antecipe as suas e escreva o que vai fazer em cada uma.' },
  { day: 35, title: 'Cinco semanas', body: 'Para muita gente a vontade fica mais rara e mais curta por aqui. Se com você ainda é frequente, não é sinal de falha; trate cada uma como uma visita que entra e vai embora.' },
  { day: 37, title: 'Padrões', body: 'Com mais registros, o app já mostra em que horas e em que situações você mais sente vontade. Use isso para se preparar, não para se julgar.' },
  { day: 40, title: 'Quarenta dias', body: 'Olhe o calendário. Cada quadrado verde é um dia que você escolheu de novo.' },
  { day: 42, title: 'Seis semanas', body: 'Função pulmonar e circulação seguem melhorando entre 2 semanas e 3 meses. Treino, escada, fôlego: compare com antes.' },
  { day: 45, title: 'Metade do caminho', body: 'Quarenta e cinco dias. Se usa reposição de nicotina, siga o plano combinado e converse com quem prescreveu antes de mudar a dose.' },
  { day: 48, title: 'Viagens e feriados', body: 'Mudança de rotina derruba hábito novo. Antes de viajar, defina o que fazer nas pausas que antes eram de cigarro.' },
  { day: 50, title: 'Cinquenta dias', body: 'Pergunta honesta: o que mudou no seu dia a dia sem fumar? Escreva no diário. Isso vale mais que qualquer estatística.' },
  { day: 53, title: 'Peso', body: 'Ganhar alguns quilos nos primeiros meses é comum e reversível. O cigarro era muito pior para o corpo do que isso.' },
  { day: 56, title: 'Oito semanas', body: 'Dois meses. Gatilhos aprendidos ainda podem acender a vontade mesmo com a abstinência física bem menor. Dá para olhar para ela de fora.' },
  { day: 58, title: 'Quem ajudou', body: 'Alguém te apoiou nesses dois meses? Agradeça. Vínculo é fator de proteção, e dizer isso em voz alta reforça.' },
  { day: 60, title: 'Sessenta dias', body: 'Dois meses. Olhe o seu histórico: o que mudou na sua rotina desde o dia zero? Isso é o que sustenta os próximos.' },
  // Fase 4: dias 61–90
  { day: 61, title: 'Manutenção', body: 'O último mês do programa é sobre tornar isso invisível. O objetivo é não pensar em cigarro, não resistir a ele.' },
  { day: 64, title: 'Sinais de alerta', body: 'Romantizar o cigarro ("era bom aquele depois do almoço"), ficar perto de quem fuma, guardar um isqueiro. São sinais, não acidentes.' },
  { day: 67, title: 'Plano de emergência', body: 'Defina: se eu fumar um, o que faço nas próximas 24 horas? Quem eu chamo? Ter o plano reduz o dano se acontecer.' },
  { day: 70, title: 'Dez semanas', body: 'Setenta dias. Tosse e falta de ar continuam diminuindo entre 1 e 9 meses para quem fumava cigarro.' },
  { day: 73, title: 'O que ficou mais fácil', body: 'Liste três coisas que ficaram mais fáceis: subir escada, dormir, sentir cheiro, não planejar o dia em torno do cigarro.' },
  { day: 76, title: 'Não dependa de motivação', body: 'Motivação oscila. O que segura é rotina: as pausas já têm outro dono, o dinheiro tem destino, o SOS está a um toque.' },
  { day: 80, title: 'Oitenta dias', body: 'Daqui a dez dias o programa acaba, mas o app continua. Marcos de 6 meses, 1 ano e 5 anos ainda vêm.' },
  { day: 84, title: 'Doze semanas', body: 'Três meses é o prazo que muitos estudos usam para contar "parou". Você está a dias disso.' },
  { day: 87, title: 'A pergunta que volta', body: '"Será que agora eu consigo fumar só socialmente?" Fumar socialmente costuma reativar o padrão antigo. Decida isso antes da festa, não durante.' },
  { day: 90, title: 'Noventa dias', body: 'Fim do programa. Você passou por abstinência, hábito, situações sociais e confiança excessiva. O que vem agora é tempo. O app fica para registrar os marcos e para o SOS, se um dia precisar.' },
];

/** Mensagem para o dia do programa. Depois de 90, repete a mais próxima anterior a cada 7 dias (semanal). */
export function messageForDay(day: number): DayMessage {
  if (day < MESSAGES[0].day) return MESSAGES[0];
  const exact = MESSAGES.find((m) => m.day === day);
  if (exact) return exact;
  if (day > 90) {
    const weekly: DayMessage[] = [
      { day, title: 'Manutenção', body: 'O programa acabou; o hábito novo continua. Abra o SOS se precisar e registre os marcos. O resto é vida.' },
      { day, title: 'Seis meses, um ano, cinco', body: 'Os próximos marcos são longos e silenciosos. Risco cardíaco e de câncer caem ao longo dos anos. Cada mês conta.' },
      { day, title: 'Vigilância leve', body: 'Festa, viagem, perda, estresse grande: são os momentos em que ex-fumantes de anos voltam. Ter o plano de emergência à mão basta.' },
      { day, title: 'Olhe o histórico', body: 'Vontades superadas, dias acumulados, lapsos registrados. É o seu registro de que isso é possível.' },
    ];
    return weekly[Math.floor((day - 91) / 7) % weekly.length];
  }
  // dia sem mensagem própria: usa a anterior mais próxima
  let best = MESSAGES[0];
  for (const m of MESSAGES) if (m.day <= day) best = m;
  return best;
}
