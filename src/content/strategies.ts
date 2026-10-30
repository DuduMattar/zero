export interface Strategy {
  id: string;
  label: string;
  short: string;
  /** instruções curtas, uma por linha */
  steps: string[];
  guided: 'breathing' | 'delay' | 'mindfulness' | 'none';
  defaultSec: number;
}

export const STRATEGIES: readonly Strategy[] = [
  {
    id: 'breathing',
    label: 'Respiração guiada',
    short: 'Respirar',
    steps: ['Inspire pelo nariz contando até 4.', 'Segure contando até 4.', 'Solte pela boca contando até 6.', 'Repita até o tempo acabar.'],
    guided: 'breathing',
    defaultSec: 180,
  },
  {
    id: 'delay',
    label: 'Adiar 10 minutos',
    short: 'Adiar',
    steps: ['Decida: "não agora, daqui a 10 minutos eu vejo".', 'Faça qualquer outra coisa enquanto o tempo passa.', 'Quando acabar, avalie de novo.'],
    guided: 'delay',
    defaultSec: 600,
  },
  {
    id: 'mindfulness',
    label: 'Observar a vontade',
    short: 'Observar',
    steps: ['Onde a vontade está no corpo? Garganta, peito, mãos?', 'Observe sem lutar. Ela sobe, atinge um pico e desce.', 'Nomeie: "isso é uma vontade, não uma ordem".'],
    guided: 'mindfulness',
    defaultSec: 180,
  },
  { id: 'water', label: 'Beber água', short: 'Água', steps: ['Encha um copo grande.', 'Beba devagar, goles pequenos.', 'Sinta a temperatura e o gosto.'], guided: 'none', defaultSec: 120 },
  { id: 'walk', label: 'Caminhada curta', short: 'Caminhar', steps: ['Levante e saia do lugar onde você está.', 'Caminhe por 5 minutos, ritmo confortável.', 'Preste atenção nos pés tocando o chão.'], guided: 'none', defaultSec: 300 },
  { id: 'environment', label: 'Mudar de ambiente', short: 'Mudar', steps: ['Saia do cômodo ou da situação.', 'Vá para um lugar onde você nunca fumou.', 'Fique lá até a vontade baixar.'], guided: 'none', defaultSec: 180 },
  { id: 'reasons', label: 'Relembrar meus motivos', short: 'Motivos', steps: ['Leia seus motivos, um por um, devagar.', 'Escolha o mais forte hoje.', 'Diga em voz baixa por que ele importa.'], guided: 'none', defaultSec: 120 },
];

export const strategyById = (id: string): Strategy => STRATEGIES.find((s) => s.id === id) ?? STRATEGIES[0];

export const TRIGGERS: readonly { id: string; label: string }[] = [
  { id: 'stress', label: 'Estresse' },
  { id: 'anxiety', label: 'Ansiedade' },
  { id: 'boredom', label: 'Tédio' },
  { id: 'after_meal', label: 'Depois de comer' },
  { id: 'coffee', label: 'Café' },
  { id: 'alcohol', label: 'Bebida alcoólica' },
  { id: 'friends', label: 'Amigos fumando' },
  { id: 'work', label: 'Trabalho' },
  { id: 'driving', label: 'Dirigindo' },
  { id: 'none', label: 'Sem motivo aparente' },
  { id: 'other', label: 'Outro' },
];

export const triggerLabel = (id: string | null | undefined): string => (id ? (TRIGGERS.find((t) => t.id === id)?.label ?? id) : '—');

export const FEELINGS: readonly string[] = ['Estressado', 'Ansioso', 'Triste', 'Entediado', 'Irritado', 'Cansado', 'Tranquilo', 'Animado', 'Sem pensar'];

export const SYMPTOMS: readonly string[] = ['Irritabilidade', 'Ansiedade', 'Dor de cabeça', 'Fome', 'Insônia', 'Tosse', 'Dificuldade de concentração', 'Tontura', 'Nenhum'];

export const REASON_PRESETS: readonly string[] = [
  'Recuperar o fôlego nos treinos',
  'Dormir melhor',
  'Não depender de nada para ficar bem',
  'Economizar dinheiro',
  'Saúde a longo prazo',
  'Dar o exemplo',
  'Orgulho de ter conseguido',
];

export const GOAL_PRESETS: readonly string[] = ['Primeira semana sem fumar', '30 dias sem nicotina', 'Correr 5 km sem parar', 'Juntar o dinheiro para uma viagem'];
