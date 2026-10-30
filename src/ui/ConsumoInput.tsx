import { CONSUMPTION_SPECS, monthlyCost, toConsumption, yearlyCost, type ConsumptionInput } from '../domain/consumption';
import { formatMoney } from '../domain/format';
import { productById, type ProductId } from '../domain/types';
import { Chip, Field, Label, inputCls } from './index';

interface Props {
  products: ProductId[];
  value: ConsumptionInput;
  onChange: (v: ConsumptionInput) => void;
  skipped: boolean;
  onSkip: (skip: boolean) => void;
}

/** Consumo na unidade em que a pessoa pensa (pod dura X dias, maços por dia). Converte no domínio. */
export function ConsumoInput({ products, value, onChange, skipped, onSkip }: Props) {
  const spec = CONSUMPTION_SPECS[value.product];
  const c = toConsumption(value);
  const amountStr = value.amount ? String(Number(value.amount.toFixed(2))).replace('.', ',') : '';
  const priceStr = value.packPrice ? String(Number(value.packPrice.toFixed(2))).replace('.', ',') : '';
  const num = (s: string) => Number(s.replace(',', '.')) || 0;

  return (
    <div className="space-y-5">
      {products.length > 1 ? (
        <div>
          <Label className="mb-2">Produto principal</Label>
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <Chip key={p} active={value.product === p} onClick={() => onChange({ product: p, amount: 0, packPrice: 0 })}>
                {productById(p).label}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      <div className={skipped ? 'opacity-40 pointer-events-none' : ''}>
        <Label className="mb-2">{spec.question}</Label>
        <div className="flex flex-wrap gap-2">
          {spec.chips.map((ch) => (
            <Chip key={ch.value} active={Math.abs(value.amount - ch.value) < 1e-9} onClick={() => onChange({ ...value, amount: ch.value })}>
              {ch.label}
            </Chip>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label={spec.mode === 'perDay' ? 'Ou digite por dia' : 'Ou digite em dias'}>
            <input className={inputCls} inputMode="decimal" placeholder={spec.mode === 'perDay' ? 'ex.: 15' : 'ex.: 4'} value={amountStr} onChange={(e) => onChange({ ...value, amount: num(e.target.value) })} data-testid="cons-amount" />
          </Field>
          <Field label={spec.priceLabel}>
            <input className={inputCls} inputMode="decimal" placeholder={spec.pricePlaceholder} value={priceStr} onChange={(e) => onChange({ ...value, packPrice: num(e.target.value) })} data-testid="cons-price" />
          </Field>
        </div>
        <div className="card mt-4 flex items-center justify-between p-4" aria-live="polite">
          <div>
            <Label>Estimativa</Label>
            <div className="tabular text-2xl font-bold">{c && c.pricePerUnit > 0 ? formatMoney(monthlyCost(c)) : '—'}</div>
            <div className="text-[0.8rem] text-ink-3">por mês{c && c.pricePerUnit > 0 ? ` · ${formatMoney(yearlyCost(c))} por ano` : ''}</div>
          </div>
          <div className="text-right text-[0.8rem] text-ink-2">
            {c ? (
              <>
                ≈ <b className="tabular text-ink">{Number(c.unitsPerDay.toFixed(2))}</b> {c.unitsPerDay === 1 ? productById(c.product).unitLabel : productById(c.product).unitLabelPlural}
                <br />
                por dia
              </>
            ) : (
              'preencha a quantidade'
            )}
          </div>
        </div>
      </div>

      <Chip active={skipped} onClick={() => onSkip(!skipped)}>
        {skipped ? '✓ ' : ''}Não sei / prefiro não calcular dinheiro
      </Chip>
    </div>
  );
}
