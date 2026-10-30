import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../app/hooks/useData';
import { useSnapshotCount } from '../../data/queries';
import { addEvent, applyPayload, createSnapshot, currentPayload, deleteSnapshot, exportBackupFile, listSnapshots, parseBackupText, restoreSnapshot, stamp, updateSettings } from '../../data/repos';
import type { Snapshot } from '../../data/db';
import { previewImport, type BackupFile, type ImportPreview } from '../../domain/backup';
import { formatDateTime } from '../../domain/format';
import { Button, Card, Label, useConfirm, useToast } from '../../ui';

function fileName(now: number) {
  const d = new Date(now);
  const p = (n: number) => String(n).padStart(2, '0');
  return `zero-backup-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.json`;
}

export function BackupPage() {
  const data = useData(60_000);
  const nav = useNavigate();
  const toast = useToast();
  const confirm = useConfirm(5000);
  const count = useSnapshotCount();
  const [snaps, setSnaps] = useState<Snapshot[]>([]);
  const [pending, setPending] = useState<{ file: BackupFile; preview: ImportPreview; testOnly: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const testRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listSnapshots().then(setSnaps);
  }, [count]);

  if (!data) return null;
  const { profile, settings, events } = data;

  async function exportNow() {
    setBusy(true);
    try {
      const now = Date.now();
      const file = await exportBackupFile(now);
      const text = JSON.stringify(file);
      const name = fileName(now);
      const blob = new Blob([text], { type: 'application/json' });
      let kind: 'share' | 'export' = 'export';
      const f = new File([blob], name, { type: 'application/json' });
      if (navigator.canShare?.({ files: [f] }) && navigator.share) {
        try {
          await navigator.share({ files: [f], title: 'Backup do ZERO' });
          kind = 'share';
        } catch (e) {
          if ((e as Error).name === 'AbortError') {
            setBusy(false);
            return;
          }
          downloadBlob(blob, name);
        }
      } else {
        downloadBlob(blob, name);
      }
      await addEvent({ ...stamp(now, profile.tz), type: 'backup_made', at: now, kind, eventCount: file.payload.events.length, checksum: file.checksum });
      await updateSettings({ lastExternalBackupAt: now });
      toast(kind === 'share' ? 'Backup enviado. Salve em Arquivos/iCloud Drive.' : 'Backup baixado.');
    } catch (e) {
      console.error(e);
      toast('Não consegui exportar.', 'err');
    } finally {
      setBusy(false);
    }
  }

  async function pickFile(f: File | undefined, testOnly: boolean) {
    if (!f) return;
    setBusy(true);
    try {
      const r = await parseBackupText(await f.text());
      if (!r.ok) {
        toast(r.error, 'err');
        return;
      }
      const preview = previewImport(r.file, await currentPayload());
      setPending({ file: r.file, preview, testOnly });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
      if (testRef.current) testRef.current.value = '';
    }
  }

  async function apply(mode: 'merge' | 'replace') {
    if (!pending) return;
    if (mode === 'replace' && !confirm.confirm('replace')) return;
    setBusy(true);
    try {
      await applyPayload(pending.file.payload, mode, Date.now());
      setPending(null);
      toast(mode === 'merge' ? 'Backup mesclado.' : 'Dados substituídos. Um snapshot local foi guardado antes.');
      nav('/');
    } catch (e) {
      console.error(e);
      toast('Falha ao importar.', 'err');
    } finally {
      setBusy(false);
    }
  }

  async function restore(id: string) {
    if (!confirm.confirm('restore' + id)) return;
    setBusy(true);
    try {
      await restoreSnapshot(id, Date.now());
      toast('Snapshot restaurado.');
      nav('/');
    } catch (e) {
      console.error(e);
      toast('Falha ao restaurar.', 'err');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <button type="button" className="text-[13px] font-semibold text-ink-3" onClick={() => nav(-1)}>
        ‹ Ajustes
      </button>
      <h1 className="text-2xl font-bold">Backups</h1>

      <Card tone="accent" className="space-y-2">
        <Label>Backup externo (o que protege de verdade)</Label>
        <div className="text-[13px] text-ink-2">Gera um arquivo JSON com tudo. No iPhone, escolha <b className="text-ink">Salvar em Arquivos → iCloud Drive</b>. Último: {settings.lastExternalBackupAt ? formatDateTime(settings.lastExternalBackupAt, profile.tz) : 'nunca'} · {events.length} eventos.</div>
        <div className="text-[12px] text-warn">O arquivo é legível por qualquer pessoa que o abrir: contém seu diário, lapsos e gatilhos. Guarde em lugar protegido. O checksum garante integridade, não sigilo.</div>
        <Button variant="primary" full size="lg" onClick={exportNow} disabled={busy} data-testid="backup-export">
          Exportar agora
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => inputRef.current?.click()} disabled={busy} data-testid="backup-import">
            Importar arquivo
          </Button>
          <Button onClick={() => testRef.current?.click()} disabled={busy} data-testid="backup-test">
            Testar restauração
          </Button>
        </div>
        <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => pickFile(e.target.files?.[0], false)} data-testid="backup-file" />
        <input ref={testRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => pickFile(e.target.files?.[0], true)} data-testid="backup-test-file" />
        <div className="text-[12px] text-ink-3">"Testar restauração" valida o arquivo e mostra o que ele contém sem alterar nada.</div>
      </Card>

      {pending ? (
        <Card tone="warn" className="space-y-2" data-testid="import-preview">
          <Label>{pending.testOnly ? 'Arquivo válido ✓' : 'Pré-visualização da importação'}</Label>
          <ul className="text-[13px] text-ink-2">
            <li>Exportado em {formatDateTime(pending.preview.exportedAt, profile.tz)}</li>
            <li>
              {pending.preview.incomingEvents} eventos no arquivo · <b className="text-ink">{pending.preview.newEvents} novos</b> · {pending.preview.duplicateEvents} já existentes
            </li>
            <li>Perfil: {pending.preview.hasProfile ? (pending.preview.profileDiffers ? 'diferente do atual' : 'igual ao atual') : 'ausente'}</li>
          </ul>
          {pending.testOnly ? (
            <Button onClick={() => setPending(null)}>Fechar</Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="primary" onClick={() => apply('merge')} disabled={busy} data-testid="import-merge">
                Mesclar
              </Button>
              <Button variant="danger" onClick={() => apply('replace')} disabled={busy} data-testid="import-replace">
                {confirm.isArmed('replace') ? 'Confirmar substituição' : 'Substituir tudo'}
              </Button>
            </div>
          )}
        </Card>
      ) : null}

      <Card className="space-y-2">
        <Label>Snapshots locais ({snaps.length})</Label>
        <div className="text-[12px] text-ink-2">
          <b className="text-ink">Cópia local</b> = guardada dentro do mesmo navegador: serve para desfazer um erro (importação, exclusão). <b className="text-ink">Não</b> protege se o iOS apagar os dados do site nem se você perder o aparelho; para isso só o <b className="text-ink">backup externo</b> acima. Automático 1×/dia (mantém 7) e antes de toda importação.
        </div>
        <Button onClick={() => createSnapshot('manual', Date.now()).then(() => toast('Snapshot criado.'))} disabled={busy}>
          Criar snapshot manual
        </Button>
        <ul className="space-y-1.5">
          {snaps.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 rounded-xl bg-card-2 px-3 py-2 text-[13px]">
              <span>
                {formatDateTime(s.createdAt, profile.tz)} · {s.kind === 'auto' ? 'auto' : 'manual'} · {s.eventCount} ev.
              </span>
              <span className="flex gap-1">
                <Button size="sm" variant={confirm.isArmed('restore' + s.id) ? 'danger' : 'secondary'} onClick={() => restore(s.id)}>
                  {confirm.isArmed('restore' + s.id) ? 'Confirmar' : 'Restaurar'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteSnapshot(s.id)} aria-label="Apagar snapshot">
                  ✕
                </Button>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
