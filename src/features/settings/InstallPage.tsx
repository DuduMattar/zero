import { useNavigate } from 'react-router-dom';
import { isIOS, isStandalone } from '../../app/hooks/useNow';
import { Card, Label } from '../../ui';

export function InstallPage() {
  const nav = useNavigate();
  const standalone = isStandalone();
  return (
    <div className="space-y-4 pt-2">
      <button type="button" className="text-[13px] font-semibold text-ink-3" onClick={() => nav(-1)}>
        ‹ Voltar
      </button>
      <h1 className="text-2xl font-bold">Adicionar à tela de início</h1>
      {standalone ? (
        <Card tone="accent">✓ Você já está usando o ZERO como app instalado.</Card>
      ) : (
        <Card className="space-y-2">
          <Label>{isIOS() ? 'No iPhone (Safari)' : 'No celular'}</Label>
          <ol className="list-decimal space-y-1 pl-5 text-[14px]">
            <li>Toque no botão <b>Compartilhar</b> (quadrado com seta para cima).</li>
            <li>Escolha <b>Adicionar à Tela de Início</b>.</li>
            <li>Confirme em <b>Adicionar</b>. O ícone ZERO aparece como um app.</li>
            <li>Abra sempre pelo ícone.</li>
          </ol>
        </Card>
      )}
      <Card className="space-y-2">
        <Label>Por que isso importa</Label>
        <ul className="space-y-1.5 text-[13px] text-ink-2">
          <li>• O app instalado e o Safari têm <b className="text-ink">armazenamentos separados</b>. O que você registrou no Safari não aparece sozinho no app instalado (e vice-versa). Para migrar: exporte um backup num e importe no outro.</li>
          <li>• Em site aberto no Safari, o iOS pode <b className="text-ink">apagar os dados após 7 dias sem uso</b>. Instalado, o risco cai, mas não some: continue fazendo backup externo.</li>
          <li className="text-danger">• <b>Remover o app da tela de início apaga todos os dados dele</b>, inclusive os backups locais. Isso vale também para trocar o ícone (o iPhone só atualiza o ícone reinstalando). Antes de remover, exporte um backup em Ajustes → Backups e importe depois.</li>
          <li>• Instalado, abre em tela cheia, sem barra do navegador, e o SOS fica a um toque do ícone.</li>
        </ul>
      </Card>
      <Card className="space-y-2">
        <Label>Lembretes sem notificação (app Atalhos)</Label>
        <ol className="list-decimal space-y-1 pl-5 text-[13px] text-ink-2">
          <li>Abra o app <b>Atalhos</b> → aba <b>Automação</b> → <b>+</b> → <b>Hora do Dia</b>.</li>
          <li>Escolha o horário e "Executar imediatamente".</li>
          <li>Ação: <b>Abrir URL</b> com <code className="text-ink">{window.location.origin + window.location.pathname}?open=diario</code> (ou <code className="text-ink">?open=sos</code> / <code className="text-ink">?open=backup</code>).</li>
        </ol>
        <div className="text-[12px] text-ink-3">Esse é o único jeito confiável e gratuito de "lembrete" sem servidor. Comportamento no iOS 27 ainda não testado por mim: confira no seu aparelho.</div>
      </Card>
    </div>
  );
}
