/** Gera uma imagem de progresso no aparelho (canvas) e compartilha; sem servidor. */
export async function shareProgress(opts: { days: number; best: string; since: string; dark: boolean }): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const W = 1080;
  const H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const bg = opts.dark ? '#0a0d12' : '#f5f6f8';
  const ink = opts.dark ? '#eef2f6' : '#0e1217';
  const ink2 = opts.dark ? '#aab4c0' : '#4b5563';
  const accent = opts.dark ? '#2fd38a' : '#0f9d6e';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // anel
  ctx.beginPath();
  ctx.arc(W / 2, 420, 220, 0, Math.PI * 2);
  ctx.lineWidth = 36;
  ctx.strokeStyle = accent;
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.font = '700 180px Inter, -apple-system, system-ui, sans-serif';
  ctx.fillText(String(opts.days), W / 2, 485);
  ctx.font = '600 44px Inter, -apple-system, system-ui, sans-serif';
  ctx.fillStyle = ink2;
  ctx.fillText(opts.days === 1 ? 'dia livre' : 'dias livres', W / 2, 560);
  ctx.fillStyle = ink;
  ctx.font = '700 64px Inter, -apple-system, system-ui, sans-serif';
  ctx.fillText('sem tabaco ou vape', W / 2, 780);
  ctx.fillStyle = ink2;
  ctx.font = '500 40px Inter, -apple-system, system-ui, sans-serif';
  ctx.fillText(`Recorde: ${opts.best}`, W / 2, 870);
  ctx.fillText(`Desde ${opts.since}`, W / 2, 930);
  ctx.fillStyle = accent;
  ctx.font = '800 44px Inter, -apple-system, system-ui, sans-serif';
  ctx.letterSpacing = '12px';
  ctx.fillText('ZERO', W / 2, 1230);

  const blob: Blob = await new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('canvas'))), 'image/png'));
  const file = new File([blob], `zero-${opts.days}-dias.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ files: [file], title: 'Meu progresso no ZERO' });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled';
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'downloaded';
}
