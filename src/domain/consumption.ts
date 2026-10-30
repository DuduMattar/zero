import type { Consumption, ProductId } from './types';

/** Como a pessoa pensa o consumo de cada produto. Converte para unidades/dia + preço/unidade. */
export type ConsumptionMode = 'perDay' | 'lastsDays';

export interface ConsumptionSpec {
  product: ProductId;
  /** unidade em que a pessoa compra/pensa: maço, pod, pacote, lata */
  packLabel: string;
  packLabelPlural: string;
  /** unidades consumidas por embalagem (cigarros por maço) — 1 quando a embalagem é a própria unidade */
  unitsPerPack: number;
  mode: ConsumptionMode;
  question: string;
  /** chips sugeridos: valor + rótulo */
  chips: { value: number; label: string }[];
  priceLabel: string;
  pricePlaceholder: string;
}

export const CONSUMPTION_SPECS: Record<ProductId, ConsumptionSpec> = {
  cigarette: { product: 'cigarette', packLabel: 'maço', packLabelPlural: 'maços', unitsPerPack: 20, mode: 'perDay', question: 'Quantos cigarros por dia?', chips: [{ value: 5, label: '5' }, { value: 10, label: '10 (½ maço)' }, { value: 20, label: '20 (1 maço)' }, { value: 30, label: '30' }, { value: 40, label: '40 (2 maços)' }], priceLabel: 'Preço do maço (20)', pricePlaceholder: 'ex.: 12,50' },
  rolled: { product: 'rolled', packLabel: 'pacote', packLabelPlural: 'pacotes', unitsPerPack: 1, mode: 'lastsDays', question: 'Um pacote de tabaco dura quanto tempo?', chips: [{ value: 2, label: '2 dias' }, { value: 3, label: '3 dias' }, { value: 7, label: '1 semana' }, { value: 14, label: '2 semanas' }], priceLabel: 'Preço do pacote', pricePlaceholder: 'ex.: 35' },
  cigar: { product: 'cigar', packLabel: 'unidade', packLabelPlural: 'unidades', unitsPerPack: 1, mode: 'perDay', question: 'Quantos por dia?', chips: [{ value: 0.5, label: '1 a cada 2 dias' }, { value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }], priceLabel: 'Preço por unidade', pricePlaceholder: 'ex.: 25' },
  vape: { product: 'vape', packLabel: 'pod', packLabelPlural: 'pods', unitsPerPack: 1, mode: 'lastsDays', question: 'Um pod dura quanto tempo?', chips: [{ value: 1, label: '1 dia' }, { value: 2, label: '2 dias' }, { value: 3, label: '3 dias' }, { value: 5, label: '5 dias' }, { value: 7, label: '1 semana' }, { value: 14, label: '2 semanas' }], priceLabel: 'Preço do pod', pricePlaceholder: 'ex.: 60' },
  heated: { product: 'heated', packLabel: 'maço', packLabelPlural: 'maços', unitsPerPack: 20, mode: 'perDay', question: 'Quantos sticks por dia?', chips: [{ value: 5, label: '5' }, { value: 10, label: '10' }, { value: 20, label: '20 (1 maço)' }, { value: 30, label: '30' }], priceLabel: 'Preço do maço (20)', pricePlaceholder: 'ex.: 20' },
  pouch: { product: 'pouch', packLabel: 'lata', packLabelPlural: 'latas', unitsPerPack: 20, mode: 'lastsDays', question: 'Uma lata dura quanto tempo?', chips: [{ value: 1, label: '1 dia' }, { value: 2, label: '2 dias' }, { value: 3, label: '3 dias' }, { value: 7, label: '1 semana' }], priceLabel: 'Preço da lata', pricePlaceholder: 'ex.: 45' },
  nrt_patch: { product: 'nrt_patch', packLabel: 'caixa', packLabelPlural: 'caixas', unitsPerPack: 7, mode: 'perDay', question: 'Adesivos por dia?', chips: [{ value: 1, label: '1' }], priceLabel: 'Preço da caixa', pricePlaceholder: '' },
  nrt_gum: { product: 'nrt_gum', packLabel: 'caixa', packLabelPlural: 'caixas', unitsPerPack: 30, mode: 'perDay', question: 'Gomas por dia?', chips: [{ value: 5, label: '5' }], priceLabel: 'Preço da caixa', pricePlaceholder: '' },
  nrt_lozenge: { product: 'nrt_lozenge', packLabel: 'caixa', packLabelPlural: 'caixas', unitsPerPack: 36, mode: 'perDay', question: 'Pastilhas por dia?', chips: [{ value: 5, label: '5' }], priceLabel: 'Preço da caixa', pricePlaceholder: '' },
};

export interface ConsumptionInput {
  product: ProductId;
  /** perDay: unidades por dia · lastsDays: dias que uma embalagem dura */
  amount: number;
  /** preço da embalagem (maço/pod/pacote/lata) */
  packPrice: number;
}

/** Converte a entrada "humana" para o modelo interno. Retorna null se faltar dado. */
export function toConsumption(input: ConsumptionInput): Consumption | null {
  const spec = CONSUMPTION_SPECS[input.product];
  if (!spec || !(input.amount > 0)) return null;
  const packPrice = Math.max(0, input.packPrice || 0);
  let unitsPerDay: number;
  if (spec.mode === 'perDay') unitsPerDay = input.amount;
  else unitsPerDay = spec.unitsPerPack / input.amount; // uma embalagem a cada N dias
  const pricePerUnit = spec.unitsPerPack > 0 ? packPrice / spec.unitsPerPack : packPrice;
  return { product: input.product, unitsPerDay, pricePerUnit };
}

/** Caminho inverso para preencher o formulário em Ajustes a partir do perfil. */
export function fromConsumption(c: Consumption): ConsumptionInput {
  const spec = CONSUMPTION_SPECS[c.product];
  const packPrice = c.pricePerUnit * spec.unitsPerPack;
  const amount = spec.mode === 'perDay' ? c.unitsPerDay : c.unitsPerDay > 0 ? spec.unitsPerPack / c.unitsPerDay : 0;
  return { product: c.product, amount, packPrice };
}

export const monthlyCost = (c: Consumption): number => c.unitsPerDay * c.pricePerUnit * 30.44;
export const yearlyCost = (c: Consumption): number => c.unitsPerDay * c.pricePerUnit * 365.25;
