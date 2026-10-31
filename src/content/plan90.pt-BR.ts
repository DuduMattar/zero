// Plano de 90 dias: uma atividade curta (≤ 2 min) por dia, por fase. Dias sem atividade própria repetem a mais próxima da fase.
// Regra editorial (revisão externa, 31/10/2026): instrução direta, sem ordem rígida, sem presumir como a pessoa está.

export interface PlanActivity {
  id: string;
  day: number; // −7 … 90
  title: string;
  how: string; // instrução concreta
  minutes: number;
  to?: string; // rota do app que a tarefa usa (botão "Abrir")
}

export const PLAN: readonly PlanActivity[] = [
  // Preparação
  { id: 'p-7', day: -7, title: 'Mapeie seus momentos', how: 'Anote os 3 momentos do dia em que você mais usa. Mude só o que já se sentir pronto para mudar.', minutes: 2 },
  { id: 'p-6', day: -6, title: 'Substituto para a pausa', how: 'Escolha o que entra no lugar do cigarro/pod na pausa do café: água, 20 passos, uma mensagem.', minutes: 1 },
  { id: 'p-5', day: -5, title: 'Conte para uma pessoa', how: 'Mande uma mensagem: "vou parar no dia X". Escolha alguém que respeite sua decisão.', minutes: 1 },
  { id: 'p-4', day: -4, title: 'Reposição de nicotina', how: 'Veja se a UBS mais perto tem tratamento para tabagismo (é gratuito pelo SUS). Ligue 136 se não souber.', minutes: 2 },
  { id: 'p-3', day: -3, title: 'Limpe o ambiente', how: 'Retire do alcance o que puder: isqueiro, cinzeiro, pod reserva, o maço "de emergência".', minutes: 2 },
  { id: 'p-2', day: -2, title: 'Treine o SOS', how: 'Abra o SOS uma vez, sem vontade, só para conhecer. Veja onde ficam "Diminuiu", "Continua" e o registro de uso.', minutes: 2, to: '/sos' },
  { id: 'p-1', day: -1, title: 'Simplifique amanhã', how: 'Tire da agenda de amanhã o que for evitável e tenso. Deixe água na cabeceira.', minutes: 1 },
  // Fase 1 · dias 0–7: abstinência inicial, gatilhos, enfrentamento, ambiente, rotina
  { id: 'd0', day: 0, title: 'Uma vontade de cada vez', how: 'Hoje o objetivo é um só: chegar na hora de dormir. Quando precisar, experimente o SOS.', minutes: 1 },
  { id: 'd1', day: 1, title: 'Primeiro registro', how: 'Registre humor, sono e vontade. Este será seu primeiro registro para acompanhar mudanças depois.', minutes: 1, to: '/diario' },
  { id: 'd2', day: 2, title: 'Água à mão', how: 'Se for conveniente, deixe uma garrafa de água onde você fica mais tempo, como uma alternativa.', minutes: 1 },
  { id: 'd3', day: 3, title: 'Caminhada curta', how: 'Se for seguro e confortável, caminhe 10 minutos sem destino. Também pode mudar de cômodo.', minutes: 10 },
  { id: 'd4', day: 4, title: 'Nomeie a vontade', how: 'Na próxima vontade, diga em voz baixa: "isso é uma vontade, não uma ordem". Use "Notar a vontade, sem agir" no SOS.', minutes: 1 },
  { id: 'd5', day: 5, title: 'Lanche à mão', how: 'Prepare um lanche que seja conveniente para você para a fome extra desta semana.', minutes: 2 },
  { id: 'd6', day: 6, title: 'Rotina da manhã', how: 'Escreva as 3 primeiras coisas que você faz ao acordar, sem o cigarro/pod. Repita amanhã.', minutes: 2 },
  { id: 'd7', day: 7, title: 'Olhe a semana', how: 'Consulte os registros da semana em Tendências, se houver. Em que situações a vontade apareceu?', minutes: 2, to: '/tendencias' },
  // Fase 2 · dias 8–30: consolidar hábitos, situações sociais, impulsos, sintomas, motivação
  { id: 'd8', day: 8, title: 'Repita a rotina', how: 'Escolha uma rotina manejável e planeje uma alternativa para ela. Não precisa se expor a um gatilho forte.', minutes: 2 },
  { id: 'd10', day: 10, title: 'Teste o paladar', how: 'Coma devagar algo que você gosta e preste atenção no sabor. Compare com a memória.', minutes: 2 },
  { id: 'd11', day: 11, title: 'Dê destino ao dinheiro', how: 'Em Tendências, crie um objetivo para a economia. Algo concreto, com valor.', minutes: 2, to: '/tendencias' },
  { id: 'd12', day: 12, title: 'Plano para a festa', how: 'Antes do próximo evento social: bebida sem álcool na mão, hora de ir embora combinada, SOS no bolso.', minutes: 2 },
  { id: 'd13', day: 13, title: 'Cheque o humor', how: 'Veja o humor dos últimos 7 dias em Tendências. Se estiver intenso, persistente ou preocupante, procure avaliação profissional.', minutes: 2, to: '/tendencias' },
  { id: 'd15', day: 15, title: 'Se usou, registre', how: 'Se houve uso, registre; a reflexão é opcional. Se não houve, abra o Histórico e olhe uma vontade que passou.', minutes: 2, to: '/historico' },
  { id: 'd17', day: 17, title: 'Álcool com regra', how: 'Defina uma regra para álcool nas próximas semanas: quantidade, lugar, companhia.', minutes: 1 },
  { id: 'd19', day: 19, title: 'Lista de 5 minutos', how: 'Escreva 3 coisas de 5 minutos para os buracos de tédio: alongar, lavar louça, ligar para alguém.', minutes: 2 },
  { id: 'd21', day: 21, title: 'Revise os motivos', how: 'Leia seus motivos no Perfil. Apague o que não é seu, acrescente o que apareceu.', minutes: 2, to: '/ajustes/perfil' },
  { id: 'd24', day: 24, title: 'Frase de identidade', how: 'Escolha uma frase que descreva seu objetivo, sem precisar fingir como se sente. Diga uma vez e repare como soa.', minutes: 1 },
  { id: 'd25', day: 25, title: 'Pedido simples', how: 'Peça a quem fuma perto de você para não fumar ao seu lado nesta fase. Talvez precise combinar de novo.', minutes: 1 },
  { id: 'd27', day: 27, title: 'Energia antes e depois', how: 'Compare a energia da primeira semana com a de agora nos registros do diário. Anote uma linha.', minutes: 2, to: '/tendencias' },
  { id: 'd30', day: 30, title: 'Marque os 30 dias', how: 'Faça algo para marcar o mês que não envolva fumar nem beber. Pode ser pequeno.', minutes: 2 },
  // Fase 3 · dias 31–60: prevenção de recaída, padrões, autonomia, identidade
  { id: 'd31', day: 31, title: 'Cuidado com a confiança', how: 'Escreva a frase que mais faria você fumar "só para testar". Agora escreva a resposta.', minutes: 2 },
  { id: 'd33', day: 33, title: 'Situações de risco', how: 'Liste 3 situações específicas que podem vir (viagem, festa, briga) e o que você faz em cada uma.', minutes: 2 },
  { id: 'd37', day: 37, title: 'Situações de pico', how: 'Se houver registros suficientes, veja em Tendências os gatilhos mais frequentes. Programe uma resposta para o próximo.', minutes: 2, to: '/tendencias' },
  { id: 'd40', day: 40, title: 'Calendário', how: 'Abra o Histórico e olhe o calendário com a legenda. Confira se falta registrar algum episódio.', minutes: 1, to: '/historico' },
  { id: 'd42', day: 42, title: 'Como está o fôlego', how: 'Observe como se sente numa atividade habitual e confortável. Isso não mede recuperação pulmonar; é a sua percepção.', minutes: 3 },
  { id: 'd45', day: 45, title: 'Metade do programa', how: 'Escreva no diário o que mudou no seu dia a dia. Uma frase honesta.', minutes: 2 },
  { id: 'd48', day: 48, title: 'Viagem ou feriado', how: 'Se tem viagem à vista, decida o que faz nas pausas que antes eram de cigarro.', minutes: 2 },
  { id: 'd53', day: 53, title: 'Peso', how: 'Se mudanças de peso preocupam você, procure orientação. Não precisa resolver isso sozinho nem abandonar o objetivo.', minutes: 1 },
  { id: 'd58', day: 58, title: 'Agradeça', how: 'Se alguém ajudou e você quiser, mande uma mensagem.', minutes: 1 },
  { id: 'd60', day: 60, title: 'Dois meses', how: 'Compartilhe seu progresso com alguém, se quiser (botão no painel). Sem obrigação.', minutes: 1 },
  // Fase 4 · dias 61–90: manutenção, longo prazo, risco, avaliação
  { id: 'd61', day: 61, title: 'Deixe invisível', how: 'Hoje, nenhuma tarefa sobre fumar. Só abra o app se precisar do SOS.', minutes: 0 },
  { id: 'd64', day: 64, title: 'Sinais de alerta', how: 'Quais destas aumentaram sua vontade? Romantizar o cigarro, ficar perto de quem fuma, guardar um isqueiro.', minutes: 1 },
  { id: 'd67', day: 67, title: 'Plano de emergência', how: 'Escreva: "Se eu fumar um, nas próximas 24 h eu…". Guarde em Perfil → metas e plano de emergência. O SOS mostra as linhas que começam com "Se eu".', minutes: 2, to: '/ajustes/perfil' },
  { id: 'd70', day: 70, title: 'Dez semanas', how: 'Registre no diário como estão a tosse e o fôlego. Sintoma persistente merece avaliação; falta de ar intensa ou dor no peito, atendimento imediato.', minutes: 1, to: '/diario' },
  { id: 'd73', day: 73, title: 'O que mudou', how: 'Registre uma mudança: o que ficou mais fácil, igual ou mais difícil. Inclusive se nada melhorou ainda.', minutes: 2 },
  { id: 'd76', day: 76, title: 'Rotina, não motivação', how: 'Confira: as pausas têm outro dono? O dinheiro tem destino? O SOS está a um toque?', minutes: 1 },
  { id: 'd80', day: 80, title: 'Próximos marcos', how: 'Abra a linha do tempo e veja os marcos de 9 meses e 1 ano, com as fontes.', minutes: 1, to: '/linha-do-tempo' },
  { id: 'd84', day: 84, title: 'Doze semanas', how: 'Olhe o Histórico inteiro. Quantas vontades sem uso? Quantos usos? Ambos contam.', minutes: 2, to: '/historico' },
  { id: 'd87', day: 87, title: 'A pergunta que volta', how: 'Se oferecerem um cigarro, qual resposta combina com seu objetivo? Decida por escrito, antes da festa.', minutes: 1 },
  { id: 'd90', day: 90, title: 'Fim do programa', how: 'Faça um backup externo. O app continua para o SOS, os registros e os marcos.', minutes: 2, to: '/ajustes/backup' },
];

export function activityForDay(day: number): PlanActivity {
  if (day < PLAN[0].day) return PLAN[0];
  const exact = PLAN.find((a) => a.day === day);
  if (exact) return exact;
  if (day > 90) return { id: 'maint', day, title: 'Manutenção', how: 'Nenhuma tarefa. Se precisar, o SOS está a um toque. Registre marcos quando vierem.', minutes: 0 };
  let best = PLAN[0];
  for (const a of PLAN) if (a.day <= day) best = a;
  return best;
}
