import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../stores/useAppStore';
import RedeemCode from './RedeemCode';
import {
  Crown,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Infinity,
  Gift
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, refreshUserProfile } = useAuth();
  const { theme } = useAppStore();
  const [showRedeemCode, setShowRedeemCode] = useState(false);

  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const currentPlan = userProfile?.plan || 'free';

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'Gratis',
      description: 'Para empezar',
      features: [
        '1 perfil',
        '5 materias por perfil',
        'Timer Pomodoro',
        'Estadisticas basicas'
      ],
      icon: Zap,
      color: 'slate'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'Contactar',
      description: 'Acceso completo',
      features: [
        'Perfiles ilimitados',
        'Materias ilimitadas',
        'Segundo Cerebro completo',
        'Grafo de conocimiento',
        'Estadisticas avanzadas',
        'Soporte prioritario'
      ],
      icon: Crown,
      color: 'amber',
      highlighted: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: 'Pago unico',
      description: 'Acceso de por vida',
      features: [
        'Todo de Premium',
        'Pago unico',
        'Actualizaciones futuras',
        'Acceso prioritario a nuevas funciones'
      ],
      icon: Infinity,
      color: 'purple'
    }
  ];

  const handleRedeemSuccess = () => {
    refreshUserProfile();
    setShowRedeemCode(false);
    // Mostrar mensaje de exito y cerrar
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl ${
        isDark ? 'bg-slate-950' : 'bg-white'
      } shadow-2xl`}>
        {/* Barra superior degradado */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        {/* Boton cerrar */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-colors ${
            isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
          }`}
        >
          <X size={24} />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4">
              <Sparkles size={16} />
              Desbloquea todo el potencial
            </div>
            <h2 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Actualiza tu plan
            </h2>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Tu plan actual: <span className="font-bold capitalize">{currentPlan}</span>
            </p>
          </div>

          {/* Vista de canjear codigo */}
          {showRedeemCode ? (
            <div className="max-w-md mx-auto">
              <RedeemCode
                theme={theme}
                onSuccess={handleRedeemSuccess}
                onClose={() => setShowRedeemCode(false)}
              />
            </div>
          ) : (
            <>
              {/* Planes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {plans.map((plan) => {
                  const Icon = plan.icon;
                  const isCurrentPlan = currentPlan === plan.id;
                  const isHighlighted = plan.highlighted;

                  return (
                    <div
                      key={plan.id}
                      className={`relative p-6 rounded-2xl transition-all ${
                        isHighlighted
                          ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white scale-105 shadow-2xl shadow-amber-500/30'
                          : isDark
                            ? 'bg-slate-900 border border-slate-800'
                            : 'bg-slate-50 border border-slate-200'
                      } ${isCurrentPlan ? 'ring-2 ring-offset-2 ring-amber-500' : ''}`}
                    >
                      {isCurrentPlan && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold">
                          Plan actual
                        </div>
                      )}

                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        isHighlighted
                          ? 'bg-white/20'
                          : isDark
                            ? 'bg-slate-800'
                            : 'bg-white shadow-md'
                      }`}>
                        <Icon size={24} className={isHighlighted ? 'text-white' : 'text-amber-500'} />
                      </div>

                      <h3 className={`text-xl font-black mb-1 ${
                        isHighlighted ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {plan.name}
                      </h3>

                      <p className={`text-2xl font-black mb-2 ${
                        isHighlighted ? 'text-white' : 'text-amber-500'
                      }`}>
                        {plan.price}
                      </p>

                      <p className={`text-sm mb-4 ${
                        isHighlighted ? 'text-white/80' : isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {plan.description}
                      </p>

                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle2 size={16} className={
                              isHighlighted ? 'text-white/80' : 'text-green-500'
                            } />
                            <span className={`text-sm ${
                              isHighlighted ? 'text-white/90' : isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Boton canjear codigo */}
              <div className="text-center">
                <button
                  onClick={() => setShowRedeemCode(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-xl hover:shadow-amber-500/30 transition-all"
                >
                  <Gift size={24} />
                  Tengo un codigo de activacion
                </button>

                <p className={`mt-4 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Contacta al administrador para obtener tu codigo de acceso premium
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
