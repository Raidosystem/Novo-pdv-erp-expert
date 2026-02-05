import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';

const resetSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type ResetFormData = z.infer<typeof resetSchema>;

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkMode } = useSettingsStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    // Verificar se há um token válido na URL
    const accessToken = searchParams.get('access_token');
    const type = searchParams.get('type');
    
    if (type !== 'recovery' || !accessToken) {
      setIsValidToken(false);
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao redefinir senha';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className={cn('text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
          Link inválido ou expirado
        </h1>
        <p className="text-gray-500">
          O link de recuperação de senha é inválido ou já expirou.
          Por favor, solicite um novo link.
        </p>
        <Button onClick={() => navigate('/login')} fullWidth>
          Voltar para Login
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className={cn('text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
          Senha alterada com sucesso!
        </h1>
        <p className="text-gray-500">
          Você será redirecionado para a página de login em instantes...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <Lock className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className={cn('text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
          Redefinir senha
        </h1>
        <p className="text-gray-500 mt-1">
          Digite sua nova senha abaixo
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nova senha"
          type={showPassword ? 'text' : 'password'}
          placeholder="********"
          error={form.formState.errors.password?.message}
          {...form.register('password')}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        
        <Input
          label="Confirmar nova senha"
          type={showPassword ? 'text' : 'password'}
          placeholder="********"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register('confirmPassword')}
        />

        <Button type="submit" fullWidth isLoading={isLoading}>
          Redefinir Senha
        </Button>
      </form>
    </div>
  );
};
