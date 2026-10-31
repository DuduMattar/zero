// Mensagem do dia, ancorada na data de parada. Dia −7 a 90; depois, semanal.
// Tom: direto, sem clichê, sem culpa. Uma ideia por dia, ≤ 2 frases.
// Regra editorial (revisão externa, 31/10/2026): afirmação clínica só com cautela e delimitada ao produto
// (o que se sabe vem de estudos com cigarro); instrução simples fica simples; nada presume como a pessoa está.

export interface DayMessage {
  day: number;
  title: string;
  body: string;
  /** ação curta e opcional (≤ 2 min) */
  action?: string;
}

export const MESSAGES: readonly DayMessage[] = [
  // Preparação
  { day: -7, title: 'Uma semana para o dia zero', body: 'Não precisa parar hoje. Observe quando, onde e com quem você costuma usar. Isso vira o seu mapa.', action: 'Anote os 3 momentos em que você mais usa.' },
  { day: -6, title: 'O que vai no lugar?', body: 'Alguns usos estão ligados a pausas: café, intervalo, fim do almoço. Escolha agora uma alternativa para uma delas.', action: 'Escolha um substituto para a pausa do café.' },
  { day: -5, title: 'Conte para uma pessoa', body: 'Escolha alguém com quem se sinta à vontade para pedir apoio e conte a data.', action: 'Mande uma mensagem: "Vou parar no dia X."' },
  { day: -4, title: 'Reposição de nicotina não é trapaça', body: 'Adesivo, goma e pastilha aumentam a chance de parar: em revisões de estudos, por volta de 50 a 60% a mais. No SUS é gratuito pela UBS.', action: 'Veja se a UBS mais perto tem tratamento para tabagismo.' },
  { day: -3, title: 'Limpe o ambiente', body: 'Isqueiro, cinzeiro, pod reserva, o maço "de emergência". O que fica à mão facilita o uso por impulso.', action: 'Se estiver pronto, tire do alcance o que sobrou.' },
  { day: -2, title: 'O plano para a primeira vontade', body: 'Se a vontade aparecer, ter a resposta decidida antes facilita: abrir o SOS, respirar, beber água, sair do lugar.', action: 'Abra o SOS uma vez só para conhecer.' },
  { day: -1, title: 'Amanhã', body: 'Tire da agenda de amanhã o que for evitável: bar, festa, reunião tensa. O primeiro dia merece ser simples.', action: 'Deixe água na cabeceira.' },
  // Fase 1: dias 1–7
  { day: 0, title: 'Dia zero', body: 'Hoje você não precisa vencer nada. Só precisa chegar até a hora de dormir sem fumar. Uma vontade de cada vez.', action: 'Se a vontade aparecer, o SOS está a um toque.' },
  { day: 1, title: 'As primeiras 24 horas', body: 'Se você parou a nicotina de vez, irritação, fome e inquietação podem aparecer. Podem fazer parte da abstinência, e também ter outras causas. Se está em reposição, siga o plano combinado com o profissional.', action: 'Registre como você está.' },
  { day: 2, title: 'Os primeiros dias', body: 'Os sintomas de abstinência costumam ser mais intensos nos primeiros dias, segundo o NHS. O ritmo varia de pessoa para pessoa.', action: 'Caminhe 10 minutos quando a vontade subir.' },
  { day: 3, title: 'Nos primeiros dias', body: 'Para quem fumava cigarro, estudos descrevem a respiração ficando mais fácil nos primeiros dias a semanas. Algumas pessoas percebem cedo; outras demoram.', action: 'Suba uma escada prestando atenção na respiração.' },
  { day: 4, title: 'Vontade não é ordem', body: 'Você pode notar a vontade sem agir sobre ela. Onde ela aparece? Garganta, peito, mãos.', action: 'Na próxima, use "Notar a vontade, sem agir" no SOS.' },
  { day: 5, title: 'Fome e sono', body: 'Fome e sono podem mudar nas primeiras semanas. Observe o que está acontecendo com você; se estiver difícil, procure orientação.', action: 'Prepare um lanche que seja conveniente para você.' },
  { day: 6, title: 'Quase uma semana', body: 'Os primeiros dias podem exigir atenção especial. Depois deles, outros desafios ainda podem aparecer.' },
  { day: 7, title: 'Uma semana', body: 'Sete dias. Sintomas e gatilhos podem continuar. Escolha uma situação para planejar.', action: 'Veja nas Tendências em que situações a vontade mais aparece.' },
  // Fase 2: dias 8–30
  { day: 8, title: 'Os gatilhos ficam', body: 'Café, fim do almoço, trânsito, bar. Quando uma rotina trouxer vontade, experimente uma resposta diferente.' },
  { day: 9, title: 'A regra do "só um"', body: 'Se surgir a ideia de usar "só uma vez", consulte seu plano antes de decidir.' },
  { day: 10, title: 'Dez dias', body: 'Quem parou de fumar pode perceber mudanças no olfato e no paladar. Você notou alguma?' },
  { day: 11, title: 'Dinheiro', body: 'Veja a economia estimada a partir do consumo informado. Dar um destino concreto a esse valor torna o progresso visível.', action: 'Defina um objetivo em Tendências.' },
  { day: 12, title: 'Situações sociais', body: 'Uma festa pode trazer gatilhos. Combine uma alternativa e uma saída antes de ir.' },
  { day: 13, title: 'Humor', body: 'Mudanças de humor podem ocorrer. Se persistirem, piorarem ou preocuparem você, procure avaliação. Não é fraqueza.' },
  { day: 14, title: 'Duas semanas', body: 'Estudos com pessoas que pararam de fumar descrevem melhora da circulação ao longo das semanas. Não medimos isso; o que você sente é o seu dado.' },
  { day: 15, title: 'Se você já usou de novo', body: 'Um uso não apaga o histórico nem significa que todo benefício anterior desapareceu. Registrar ajuda a ver o que puxou e a planejar a próxima situação parecida.' },
  { day: 16, title: 'Sono', body: 'Seu sono mudou? Consulte seus registros, sem esperar um prazo específico.' },
  { day: 17, title: 'Álcool', body: 'O álcool pode tornar mais difícil seguir seu plano. Considere isso ao se preparar.' },
  { day: 18, title: 'Vape também', body: 'Pods com nicotina podem causar dependência. Padrões de uso e evidências de recuperação diferem dos cigarros, e para vape ainda se sabe menos.' },
  { day: 19, title: 'Tédio', body: 'Se o tédio costuma trazer vontade, prepare algumas opções curtas para esses buracos.', action: 'Escreva 3 coisas de 5 minutos.' },
  { day: 20, title: 'Vinte dias', body: 'Veja as situações que você registrou e o que tentou em cada uma.' },
  { day: 21, title: 'Três semanas', body: 'Usar novamente pode facilitar a volta ao padrão anterior. Se acontecer, registre e reorganize o plano.' },
  { day: 22, title: 'Estresse', body: 'Parte do alívio ao fumar pode vir da redução temporária da abstinência. Estresse também merece outras formas de apoio.' },
  { day: 23, title: 'Respiração', body: 'Você pode experimentar respirar devagar por alguns minutos. Se houver desconforto, volte ao seu ritmo.' },
  { day: 24, title: 'Identidade', body: 'Que frase descreve melhor seu objetivo hoje? Use palavras que façam sentido para você.' },
  { day: 25, title: 'Quem fuma perto', body: 'Você pode pedir que não fumem perto de você enquanto atravessa esta fase.' },
  { day: 26, title: 'Tosse', body: 'Quem fumava cigarro pode notar mudança na tosse. Tosse persistente merece avaliação. Falta de ar intensa, dor no peito ou sangue exigem atendimento imediato (SAMU 192).' },
  { day: 27, title: 'Energia', body: 'Compare a energia da primeira semana com a de agora nos seus registros. O gráfico mostra o que você registrou; observe também os dias sem registro.' },
  { day: 28, title: 'Quatro semanas', body: 'Algumas alternativas podem estar ficando familiares; outras ainda exigem esforço. As duas coisas são normais.' },
  { day: 29, title: 'Amanhã, 30', body: 'Se quiser, escolha uma forma de reconhecer o caminho percorrido que não envolva fumar nem beber.' },
  { day: 30, title: 'Trinta dias', body: 'Um mês é um marco. Escolha uma situação que ainda exige cuidado e combine consigo o que fará quando ela acontecer.' },
  // Fase 3: dias 31–60
  { day: 31, title: 'Segundo mês', body: 'Vontades fortes e excesso de confiança ("já consigo controlar") podem aparecer em momentos diferentes. Não precisa testar.' },
  { day: 33, title: 'Situações de risco', body: 'Viagens, festas, perdas ou conflitos podem trazer desafios. Planeje os que fazem sentido para você.' },
  { day: 35, title: 'Cinco semanas', body: 'A frequência das vontades varia. Continuar sentindo vontade não significa falha; trate cada uma como uma visita que entra e vai embora.' },
  { day: 37, title: 'Padrões', body: 'Se houver registros suficientes, consulte em Tendências as situações mais registradas. Use isso para se preparar, não para se julgar.' },
  { day: 40, title: 'Quarenta dias', body: 'Olhe o calendário. Ele resume o que você registrou; confira se falta registrar algum episódio.' },
  { day: 42, title: 'Seis semanas', body: 'Estudos com pessoas que pararam de fumar descrevem mudanças de fôlego e circulação ao longo de semanas e meses. O app não mede o seu fôlego.' },
  { day: 45, title: 'Metade do programa', body: 'Quarenta e cinco dias. Se usa reposição de nicotina, siga o plano combinado e converse com quem prescreveu antes de mudar a dose.' },
  { day: 48, title: 'Viagens e feriados', body: 'Uma mudança de rotina pode dificultar hábitos recentes. Antes de viajar, defina o que fazer nas pausas que antes eram de cigarro.' },
  { day: 50, title: 'Cinquenta dias', body: 'O que mudou no seu dia a dia? Escreva nos seus registros. Seu relato complementa os números.' },
  { day: 53, title: 'Peso', body: 'O peso pode mudar nos primeiros meses. Se isso preocupa você, procure orientação sem abandonar o objetivo de parar.' },
  { day: 56, title: 'Oito semanas', body: 'Gatilhos aprendidos podem continuar presentes mesmo quando outros sintomas diminuem. Dá para olhar para eles de fora.' },
  { day: 58, title: 'Quem ajudou', body: 'Se alguém ajudou e você quiser, agradeça e diga qual apoio é útil agora.' },
  { day: 60, title: 'Sessenta dias', body: 'Dois meses. Escolha uma mudança que gostaria de manter nas próximas semanas.' },
  // Fase 4: dias 61–90
  { day: 61, title: 'Manutenção', body: 'O último mês do programa é sobre viver a sua rotina com apoio disponível quando precisar.' },
  { day: 64, title: 'Sinais de alerta', body: 'Romantizar o cigarro, ficar perto de quem fuma, guardar um isqueiro. Algumas situações podem aumentar sua vontade; observe quais afetam você.' },
  { day: 67, title: 'Plano de emergência', body: 'Defina: se eu fumar um, o que faço nas próximas 24 horas? Quem eu chamo? Um plano facilita o que fazer depois de um uso.' },
  { day: 70, title: 'Dez semanas', body: 'Estudos descrevem redução de tosse e falta de ar ao longo dos meses para quem parou de fumar cigarro. Persistência ou piora merece avaliação.' },
  { day: 73, title: 'O que mudou', body: 'O que ficou mais fácil, igual ou mais difícil? Subir escada, dormir, sentir cheiro, planejar o dia.' },
  { day: 76, title: 'Não dependa de motivação', body: 'Motivação oscila. Rotina, apoio e tratamento podem ajudar quando ela baixa: as pausas têm outro dono, o dinheiro tem destino, o SOS está a um toque.' },
  { day: 80, title: 'Oitenta dias', body: 'Daqui a dez dias o programa acaba, mas o app continua. Marcos de 9 meses, 1 ano e mais ainda vêm na linha do tempo.' },
  { day: 84, title: 'Doze semanas', body: 'Você se aproxima do fim do programa. Isso não define sozinho a continuidade; é um ponto de passagem.' },
  { day: 87, title: 'A pergunta que volta', body: '"Será que agora eu consigo fumar só socialmente?" Fumar socialmente pode facilitar a retomada do consumo. Decida isso antes da festa, não durante.' },
  { day: 90, title: 'Noventa dias', body: 'O programa chegou ao fim. Seu histórico e as ferramentas continuam disponíveis: o SOS, os registros, a linha do tempo.' },
];

/** Em recaída, a mensagem do dia não celebra prazos: fala do estado real. */
export const RELAPSE_MESSAGE: DayMessage = {
  day: 0,
  title: 'Em recaída',
  body: 'O app não vai contar semanas que não aconteceram. Quando quiser recomeçar, marque um novo ponto de partida; seus dias somados e seu histórico continuam guardados.',
  action: 'Se bater vontade, o SOS continua funcionando.',
};

/** Mensagem para o dia do programa. Depois de 90, repete a mais próxima anterior a cada 7 dias (semanal). */
export function messageForDay(day: number): DayMessage {
  if (day < MESSAGES[0].day) return MESSAGES[0];
  const exact = MESSAGES.find((m) => m.day === day);
  if (exact) return exact;
  if (day > 90) {
    const weekly: DayMessage[] = [
      { day, title: 'Manutenção', body: 'O SOS e seus registros continuam disponíveis, esteja você mantendo ou retomando seu plano.' },
      { day, title: 'Os marcos longos', body: 'Para quem deixou de fumar, estudos descrevem redução de riscos ao longo dos anos. Veja a linha do tempo, com as fontes.' },
      { day, title: 'Vigilância leve', body: 'Festa, viagem, perda, estresse grande: momentos em que o consumo pode voltar. O plano é uma ferramenta; apoio ou tratamento também podem ser necessários.' },
      { day, title: 'Olhe o histórico', body: 'Vontades sem uso, dias somados, usos registrados. É o seu registro de que isso é possível.' },
    ];
    return weekly[Math.floor((day - 91) / 7) % weekly.length];
  }
  // dia sem mensagem própria: usa a anterior mais próxima
  let best = MESSAGES[0];
  for (const m of MESSAGES) if (m.day <= day) best = m;
  return best;
}
