
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Package, 
  Printer, 
  CreditCard, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: OnboardingStep[] = [
  {
    id: 'empresa',
    title: 'Dados da Empresa',
    description: 'Configure as informações básicas da sua empresa',
    icon: <Building2 className="w-6 h-6" />,
  },
  {
    id: 'produtos',
    title: 'Produtos',
    description: 'Importe ou cadastre seus produtos',
    icon: <Package className="w-6 h-6" />,
  },
  {
    id: 'impressora',
    title: 'Impressora',
    description: 'Configure sua impressora térmica',
    icon: <Printer className="w-6 h-6" />,
  },
  {
    id: 'pagamento',
    title: 'Formas de Pagamento',
    description: 'Configure as formas de pagamento aceitas',
    icon: <CreditCard className="w-6 h-6" />,
  },
];

export const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Form states for each step
  const [empresa, setEmpresa] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    telefone: '',
  });

  const [impressora, setImpressora] = useState({
    tipo: 'termica',
    modelo: '',
    porta: '',
  });

  const [formasPagamento, setFormasPagamento] = useState({
    dinheiro: true,
    cartaoCredito: true,
    cartaoDebito: true,
    pix: true,
  });

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    // Save all settings
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('empresa_data', JSON.stringify(empresa));
    navigate('/dashboard');
  };

  const isLastStep = currentStep === steps.length - 1;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Input
              label="Nome da Empresa"
              placeholder="Ex: Loja FastPOS"
              value={empresa.nome}
              onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })}
            />
            <Input
              label="CNPJ"
              placeholder="00.000.000/0000-00"
              value={empresa.cnpj}
              onChange={(e) => setEmpresa({ ...empresa, cnpj: e.target.value })}
            />
            <Input
              label="Endereço"
              placeholder="Rua, número, bairro, cidade - UF"
              value={empresa.endereco}
              onChange={(e) => setEmpresa({ ...empresa, endereco: e.target.value })}
            />
            <Input
              label="Telefone"
              placeholder="(00) 00000-0000"
              value={empresa.telefone}
              onChange={(e) => setEmpresa({ ...empresa, telefone: e.target.value })}
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <p className="text-gray-500 dark:text-gray-400">
              Você pode importar produtos de uma planilha ou cadastrar manualmente.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 cursor-pointer hover:border-primary-500 transition-colors">
                <Package className="w-8 h-8 text-primary-500 mb-4" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Importar Planilha
                </h4>
                <p className="text-sm text-gray-500">
                  Importe produtos de um arquivo Excel ou CSV
                </p>
              </Card>
              <Card className="p-6 cursor-pointer hover:border-primary-500 transition-colors">
                <Package className="w-8 h-8 text-primary-500 mb-4" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Cadastrar Manualmente
                </h4>
                <p className="text-sm text-gray-500">
                  Adicione produtos um por um
                </p>
              </Card>
            </div>
            <Button variant="secondary">Pular por Agora</Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Impressora
              </label>
              <select
                value={impressora.tipo}
                onChange={(e) => setImpressora({ ...impressora, tipo: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="termica">Térmica 80mm</option>
                <option value="termica58">Térmica 58mm</option>
                <option value="matricial">Matricial</option>
                <option value="laser">Laser</option>
              </select>
            </div>
            <Input
              label="Modelo"
              placeholder="Ex: Epson TM-T20X"
              value={impressora.modelo}
              onChange={(e) => setImpressora({ ...impressora, modelo: e.target.value })}
            />
            <Input
              label="Porta / IP"
              placeholder="Ex: USB001 ou 192.168.1.100"
              value={impressora.porta}
              onChange={(e) => setImpressora({ ...impressora, porta: e.target.value })}
            />
            <Button variant="secondary">Testar Impressão</Button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Selecione as formas de pagamento que sua loja aceita:
            </p>
            {[
              { key: 'dinheiro', label: 'Dinheiro' },
              { key: 'cartaoCredito', label: 'Cartão de Crédito' },
              { key: 'cartaoDebito', label: 'Cartão de Débito' },
              { key: 'pix', label: 'PIX' },
            ].map((forma) => (
              <label
                key={forma.key}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary-500"
              >
                <span className="text-gray-900 dark:text-white">{forma.label}</span>
                <input
                  type="checkbox"
                  checked={formasPagamento[forma.key as keyof typeof formasPagamento]}
                  onChange={(e) =>
                    setFormasPagamento({
                      ...formasPagamento,
                      [forma.key]: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar with steps */}
      <div className="hidden lg:flex w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">FastPOS</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Configuração Inicial
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Configure sua loja em poucos passos
          </p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {steps.map((step, index) => (
              <li key={step.id}>
                <button
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
                    currentStep === index
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      completedSteps.has(index)
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : currentStep === index
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                        : 'bg-gray-100 dark:bg-gray-700'
                    )}
                  >
                    {completedSteps.has(index) ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">F</span>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">
              Passo {currentStep + 1} de {steps.length}
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {steps[currentStep].title}
            </div>
          </div>
        </div>

        {/* Progress bar (mobile) */}
        <div className="lg:hidden h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-primary-500 transition-all"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-xl p-8">
            <div className="mb-6">
              <div className="hidden lg:flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                  {steps[currentStep].icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Passo {currentStep + 1} de {steps.length}
                  </p>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {steps[currentStep].title}
                  </h1>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {steps[currentStep].description}
              </p>
            </div>

            {renderStepContent()}

            <div className="flex justify-between mt-8">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>
              {isLastStep ? (
                <Button onClick={handleFinish}>
                  Concluir
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
