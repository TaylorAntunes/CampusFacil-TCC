import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { NeonButton } from '@/components/NeonButton';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [token] = useState(params.get('token') || '');
  const [email, setEmail] = useState(params.get('email') || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  async function confirm() {
    setBusy(true); setError('');
    try {
      await api.post('/users/verify-email', { token });
      setConfirmed(true); setMessage('E-mail confirmado. Você já pode entrar na sua conta.');
      window.history.replaceState(null, '', '/verify-email');
    } catch (err: any) { setError(err.response?.data?.message || 'Não foi possível confirmar o e-mail.'); }
    finally { setBusy(false); }
  }
  async function resend(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const response = await api.post('/users/resend-verification', { email });
      setMessage(response.data.message);
    } catch (err: any) { setError(err.response?.data?.message || 'Não foi possível reenviar a confirmação.'); }
    finally { setBusy(false); }
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 space-y-6">
        <Mail className="h-10 w-10 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Confirme seu e-mail institucional</h1>
        <p className="text-sm text-muted-foreground">Para participar, confirme a titularidade do seu endereço @ifce.edu.br pelo link de confirmação. O link é válido por 30 minutos e só pode ser utilizado uma vez.</p>
        {message && <p role="status" className="text-sm text-foreground">{message}</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {token && !confirmed && <NeonButton disabled={busy} onClick={confirm} className="w-full">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirmar meu e-mail'}</NeonButton>}
        {!confirmed && <form onSubmit={resend} className="space-y-3">
          <label htmlFor="verification-email" className="block text-sm font-medium">E-mail institucional</label>
          <input id="verification-email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="seu.nome@ifce.edu.br" className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm" />
          <NeonButton type="submit" variant="outline" disabled={busy} className="w-full">Reenviar confirmação</NeonButton>
        </form>}
        <Link to="/login" className="block text-center text-primary hover:underline">Ir para o login</Link>
      </section>
    </div>
  );
}
