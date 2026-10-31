import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'calm';

export function Button({
  variant = 'secondary',
  full,
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; full?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const base = 'press inline-flex items-center justify-center gap-2 rounded-2xl font-semibold disabled:opacity-40 disabled:pointer-events-none select-none';
  const sizes = { sm: 'min-h-10 px-3 text-sm', md: 'min-h-12 px-4 text-[15px]', lg: 'min-h-14 px-5 text-base' }[size];
  const variants: Record<Variant, string> = {
    primary: 'bg-accent text-accent-ink',
    secondary: 'bg-card-2 text-ink border border-line',
    ghost: 'bg-transparent text-ink-2',
    danger: 'bg-transparent text-danger border border-danger/40',
    calm: 'bg-calm text-white',
  };
  return <button className={`${base} ${sizes} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`} {...props} />;
}

export function Card({ children, className = '', tone = 'default', ...rest }: React.HTMLAttributes<HTMLDivElement> & { tone?: 'default' | 'accent' | 'warn' | 'danger' }) {
  const tones = {
    default: '',
    accent: 'border-accent/40',
    warn: 'border-warn/50',
    danger: 'border-danger/40',
  }[tone];
  return (
    <div className={`card p-4 ${tones} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`display text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink-3 ${className}`}>{children}</div>;
}

export function Stat({ label, value, sub, big }: { label: string; value: ReactNode; sub?: ReactNode; big?: boolean }) {
  return (
    <div className="card p-4">
      <Label>{label}</Label>
      <div className={`tabular mt-1 font-semibold leading-none ${big ? 'text-4xl' : 'text-2xl'}`}>{value}</div>
      {sub ? <div className="mt-1 text-[13px] text-ink-2">{sub}</div> : null}
    </div>
  );
}

export function Chip({ active, children, onClick, className = '' }: { active?: boolean; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`press min-h-10 rounded-full border px-3.5 text-sm font-medium ${active ? 'border-accent bg-accent/15 text-ink' : 'border-line bg-card-2 text-ink-2'} ${className}`}
    >
      {children}
    </button>
  );
}

/** Escala por toque. min..max inclusivo. */
export function Scale({ value, onChange, min = 0, max = 10, labels, ariaLabel }: { value: number | null; onChange: (v: number) => void; min?: number; max?: number; labels?: [string, string]; ariaLabel: string }) {
  const items = [];
  for (let i = min; i <= max; i++) items.push(i);
  return (
    <div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }} role="radiogroup" aria-label={ariaLabel}>
        {items.map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            onClick={() => onChange(i)}
            className={`press tabular min-h-11 rounded-xl border text-sm font-semibold ${value === i ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-card-2 text-ink-2'}`}
          >
            {i}
          </button>
        ))}
      </div>
      {labels ? (
        <div className="mt-1.5 flex justify-between text-[11px] text-ink-3">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      ) : null}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[13px] font-semibold text-ink-2">{label}</div>
      {children}
      {hint ? <div className="mt-1 text-[12px] text-ink-3">{hint}</div> : null}
    </label>
  );
}

export const inputCls = 'w-full rounded-xl border border-line bg-card-2 px-3.5 py-3 outline-none focus:border-accent';

export function Segmented<T extends string>({ value, onChange, options, ariaLabel }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; ariaLabel: string }) {
  return (
    <div className="grid gap-1 rounded-2xl bg-bg-2 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }} role="tablist" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`press min-h-10 rounded-xl text-sm font-semibold ${value === o.value ? 'bg-card text-ink shadow-sm' : 'text-ink-3'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Progress({ value01, tone = 'accent' }: { value01: number; tone?: 'accent' | 'calm' | 'warn' }) {
  const c = { accent: 'bg-accent', calm: 'bg-calm', warn: 'bg-warn' }[tone];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-2" role="progressbar" aria-valuenow={Math.round(value01 * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${c}`} style={{ width: `${Math.max(2, Math.min(100, value01 * 100))}%` }} />
    </div>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50" onClick={onClose} role="presentation">
      <div className="fade-up safe-bottom max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card p-4 pb-6" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        {title ? <h2 className="mb-3 text-lg font-bold">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-6 text-center">
      <div className="text-base font-semibold">{title}</div>
      <div className="text-[13px] text-ink-2">{body}</div>
      {action}
    </div>
  );
}

// ---------- Toast ----------
interface ToastCtx {
  show: (msg: string, kind?: 'ok' | 'err') => void;
}
const ToastContext = createContext<ToastCtx>({ show: () => {} });
export const useToast = () => useContext(ToastContext).show;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<{ msg: string; kind: 'ok' | 'err' } | null>(null);
  const timer = useRef<number | null>(null);
  const show = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    setT({ msg, kind });
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setT(null), 3000);
  }, []);
  const ctx = useMemo(() => ({ show }), [show]);
  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {t ? (
        <div role="status" className={`fade-up fixed bottom-[calc(84px+env(safe-area-inset-bottom))] left-1/2 z-50 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg ${t.kind === 'err' ? 'bg-danger text-white' : 'bg-ink text-bg'}`}>
          {t.msg}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

/** Confirmação em dois toques, sem diálogos nativos. */
export function useConfirm(ms = 4000) {
  const [armed, setArmed] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  return {
    isArmed: (key: string) => armed === key,
    confirm(key: string): boolean {
      if (armed === key) {
        setArmed(null);
        return true;
      }
      setArmed(key);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setArmed(null), ms);
      return false;
    },
  };
}
