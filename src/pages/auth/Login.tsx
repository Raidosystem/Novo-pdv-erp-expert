import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Zap, AlertCircle, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const signUpSchema = loginSchema.extend({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();
  const { isDarkMode } = useSettingsStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { nome: '', email: '', password: '', confirmPassword: '' },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    const { error } = await signIn(data.email, data.password);
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Email ou senha incorretos' : error.message);
      setIsLoading(false);
      return;
    }
    const from = (location.state as any)?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  const onSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);
    const { error } = await signUp(data.email, data.password, data.nome);
    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }
    setSuccessMessage('Conta criada! Verifique seu email para confirmar.');
    setMode('login');
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className={cn('text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
          {mode === 'login' && 'Bem-vindo de volta'}
          {mode === 'signup' && 'Criar conta'}
          {mode === 'forgot' && 'Recuperar senha'}
        </h1>
        <p className="text-gray-500 mt-1">
          {mode === 'login' && 'Entre com suas credenciais para continuar'}
          {mode === 'signup' && 'Preencha os dados para criar sua conta'}
          {mode === 'forgot' && 'Digite seu email para recuperar a senha'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      {mode === 'login' && (
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
          <Input label="Email" type="email" placeholder="seu@email.com" error={loginForm.formState.errors.email?.message} {...loginForm.register('email')} />
          <Input label="Senha" type={showPassword ? 'text' : 'password'} placeholder="********" error={loginForm.formState.errors.password?.message} {...loginForm.register('password')}
            rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Lembrar-me</span>
            </label>
            <button type="button" onClick={() => setMode('forgot')} className="text-sm text-orange-500 hover:text-orange-600">Esqueci a senha</button>
          </div>
          <Button type="submit" fullWidth isLoading={isLoading}>Entrar</Button>
        </form>
      )}

      {mode === 'signup' && (
        <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
          <Input label="Nome completo" type="text" placeholder="Seu nome" error={signUpForm.formState.errors.nome?.message} {...signUpForm.register('nome')} />
          <Input label="Email" type="email" placeholder="seu@email.com" error={signUpForm.formState.errors.email?.message} {...signUpForm.register('email')} />
          <Input label="Senha" type={showPassword ? 'text' : 'password'} placeholder="********" error={signUpForm.formState.errors.password?.message} {...signUpForm.register('password')}
            rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} />
          <Input label="Confirmar senha" type={showPassword ? 'text' : 'password'} placeholder="********" error={signUpForm.formState.errors.confirmPassword?.message} {...signUpForm.register('confirmPassword')} />
          <Button type="submit" fullWidth isLoading={isLoading}><UserPlus className="w-4 h-4" />Criar conta</Button>
        </form>
      )}

      {mode === 'forgot' && (
        <form onSubmit={(e) => { e.preventDefault(); setMode('login'); }} className="space-y-4">
          <Input label="Email" type="email" placeholder="seu@email.com" />
          <Button type="submit" fullWidth>Enviar link de recuperacao</Button>
        </form>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className={cn('w-full border-t', isDarkMode ? 'border-gray-800' : 'border-gray-200')} /></div>
        <div className="relative flex justify-center text-sm"><span className={cn('px-2', isDarkMode ? 'bg-gray-900 text-gray-500' : 'bg-white text-gray-500')}>ou</span></div>
      </div>

      {mode === 'login' ? (
        <Button variant="secondary" fullWidth onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }}><UserPlus className="w-4 h-4" />Criar nova conta</Button>
      ) : (
        <Button variant="secondary" fullWidth onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}><Zap className="w-4 h-4" />Voltar para login</Button>
      )}

      <div className={cn('text-center text-xs p-3 rounded-lg', isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}>
        <p className="font-medium mb-1">Para testar, crie uma conta</p>
        <p>Ou acesse Supabase Dashboard - Authentication - Users</p>
      </div>
    </div>
  );
};
