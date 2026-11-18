import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { NeonButton } from '@/components/NeonButton';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface FieldError {
  email?: string;
  password?: string;
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
        <Icon
          className={cn(
            'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200',
            error ? 'text-red-400' : 'text-muted-foreground group-focus-within:text-primary'
          )}
        />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          data-testid={`input-${id}`}
          className={cn(
            'w-full h-13 bg-input border rounded-xl pl-12 pr-12 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:outline-none',
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

function GoogleButton() {
  return (
    <button
      type="button"
      data-testid="button-google-login"
      className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white/5 border border-border text-sm font-medium hover:bg-white/10 hover:border-border/80 transition-all duration-200 group"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      <span className="text-muted-foreground group-hover:text-foreground transition-colors">Continuar com Google</span>
    </button>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading: authLoading, error: authError } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validate = (): boolean => {
    const newErrors: FieldError = {};
    if (!email.trim()) newErrors.email = 'O email é obrigatório.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Digite um email válido.';
    if (!password) newErrors.password = 'A senha é obrigatória.';
    else if (password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await login(email, password);
      addToast('success', 'Login realizado com sucesso!');
      setSuccessMessage('Login realizado com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || authError || 'Erro ao fazer login';
      addToast('error', errorMsg);
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-1/3 -left-24 w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-[350px] h-[350px] bg-primary/8 rounded-full blur-[100px] -z-10 pointer-events-none" />

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
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Entrar na sua conta</h1>
            <p className="text-sm text-muted-foreground">Acesse seus serviços, solicitações e conversas no CampusFácil.</p>
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
            <span className="text-xs text-muted-foreground">ou continue com email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {(authError && !successMessage) && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <NeonInput
              id="email"
              type="email"
              placeholder="seu.nome@ifce.edu.br"
              value={email}
              onChange={(value) => { setEmail(value); setErrors((prev) => ({ ...prev, email: undefined })); }}
              icon={Mail}
              error={errors.email}
              autoComplete="email"
            />

            <NeonInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha"
              value={password}
              onChange={(value) => { setPassword(value); setErrors((prev) => ({ ...prev, password: undefined })); }}
              icon={Lock}
              error={errors.password}
              autoComplete="current-password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group" data-testid="checkbox-remember">
                <div
                  onClick={() => setRememberMe((prev) => !prev)}
                  className={cn(
                    'w-5 h-5 rounded flex items-center justify-center border transition-all duration-200 cursor-pointer',
                    rememberMe
                      ? 'bg-primary border-primary shadow-[0_0_8px_rgba(0,212,255,0.4)]'
                      : 'border-border group-hover:border-primary/50 bg-input'
                  )}
                >
                  {rememberMe && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Lembrar de mim</span>
              </label>

              <Link to="#" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                Esqueceu a senha?
              </Link>
            </div>

            <NeonButton
              type="submit"
              size="lg"
              disabled={isSubmitting || authLoading}
              className="w-full mt-1 rounded-xl"
              data-testid="button-submit-login"
            >
              {(isSubmitting || authLoading) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </NeonButton>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to={'/verify-email?email=' + encodeURIComponent(email.trim())} className="text-primary hover:underline">
              Confirmar e-mail ou reenviar confirmação
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem conta?{' '}
            <Link to="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Cadastre-se
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
