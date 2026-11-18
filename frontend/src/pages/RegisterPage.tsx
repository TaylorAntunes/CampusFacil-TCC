import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { NeonButton } from '@/components/NeonButton';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: 'Muito fraca', color: 'bg-red-500' },
    { label: 'Fraca', color: 'bg-orange-500' },
    { label: 'Média', color: 'bg-yellow-500' },
    { label: 'Forte', color: 'bg-green-400' },
    { label: 'Muito forte', color: 'bg-primary' },
  ];
  return { score, ...levels[score] };
}

function NeonInput({
  id,
  type,
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  rightElement,
  autoComplete,
}: {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ElementType;
  error?: string;
  rightElement?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative group">
        <Icon className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200',
          error ? 'text-red-400' : 'text-muted-foreground group-focus-within:text-primary'
        )} />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          data-testid={`input-${id}`}
          className={cn(
            'w-full bg-input border rounded-xl pl-12 pr-12 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:outline-none',
            error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
              : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_15px_rgba(0,212,255,0.15)]'
          )}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs text-red-400 pl-1"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  if (!password) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-1.5 -mt-1"
    >
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'flex-1 h-1 rounded-full transition-all duration-300',
              i < strength.score ? strength.color : 'bg-border'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs pl-1', strength.score <= 1 ? 'text-red-400' : strength.score === 2 ? 'text-yellow-400' : 'text-green-400')}>
        Força da senha: {strength.label}
      </p>
    </motion.div>
  );
}

function GoogleButton() {
  return (
    <button
      type="button"
      data-testid="button-google-signup"
      className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white/5 border border-border text-sm font-medium hover:bg-white/10 hover:border-border/80 transition-all duration-200 group"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span className="text-muted-foreground group-hover:text-foreground transition-colors">Continuar com Google</span>
    </button>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading: authLoading, error: authError } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    if (!name.trim()) newErrors.name = 'O nome completo é obrigatório.';
    else if (name.trim().length < 3) newErrors.name = 'O nome deve ter pelo menos 3 caracteres.';
    if (!email.trim()) newErrors.email = 'O email é obrigatório.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Digite um email válido.';
    else if (!/^[^\s@]+@ifce\.edu\.br$/i.test(email.trim())) newErrors.email = 'Use seu e-mail institucional @ifce.edu.br.';
    if (!password) newErrors.password = 'A senha é obrigatória.';
    else if (password.length < 8) newErrors.password = 'A senha deve ter pelo menos 8 caracteres.';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirme sua senha.';
    else if (confirmPassword !== password) newErrors.confirmPassword = 'As senhas não coincidem.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await register(name, email.trim(), password);
      addToast('success', 'Conta criada. Confirme seu e-mail institucional para entrar.');
      setSuccessMessage('Conta criada. Confirme seu e-mail institucional para entrar.');
      setTimeout(() => {
        navigate('/verify-email?email=' + encodeURIComponent(email.trim()));
      }, 1200);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || authError || 'Erro ao se registrar';
      addToast('error', errorMsg);
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 -left-24 w-[350px] h-[350px] bg-secondary/8 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.5)] group-hover:shadow-[0_0_30px_rgba(0,212,255,0.7)] transition-all">
              <GraduationCap className="w-7 h-7 text-background" />
            </div>
            <span className="text-3xl font-bold tracking-tight">CampusFácil</span>
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Criar conta</h1>
            <p className="text-sm text-muted-foreground">Cadastro destinado à comunidade acadêmica do IFCE, com e-mail institucional @ifce.edu.br.</p>
          </div>

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6"
            >
              <CheckCircle className="w-5 h-5 shrink-0" />
              {successMessage}
            </motion.div>
          )}

          <GoogleButton />

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou preencha os dados</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <NeonInput
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(v) => { setName(v); clearError('name'); }}
              icon={User}
              error={errors.name}
              autoComplete="name"
            />

            <NeonInput
              id="email"
              type="email"
              placeholder="seu.nome@ifce.edu.br"
              value={email}
              onChange={(v) => { setEmail(v); clearError('email'); }}
              icon={Mail}
              error={errors.email}
              autoComplete="email"
            />

            <div className="flex flex-col gap-3">
              <NeonInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Crie uma senha segura"
                value={password}
                onChange={(v) => { setPassword(v); clearError('password'); }}
                icon={Lock}
                error={errors.password}
                autoComplete="new-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    data-testid="button-toggle-password"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
              <PasswordStrengthBar password={password} />
            </div>

            <NeonInput
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(v) => { setConfirmPassword(v); clearError('confirmPassword'); }}
              icon={Lock}
              error={errors.confirmPassword}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  data-testid="button-toggle-confirm"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Ao criar uma conta você concorda com nossos{' '}
              <Link to="#" className="text-primary hover:underline">Termos de Uso</Link>
              {' '}e{' '}
              <Link to="#" className="text-primary hover:underline">Política de Privacidade</Link>.
            </p>

            <NeonButton
              type="submit"
              size="lg"
              disabled={isSubmitting || authLoading}
              className="w-full rounded-xl"
              data-testid="button-submit-cadastro"
            >
              {(isSubmitting || authLoading) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </NeonButton>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Entrar
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
