import React, { useState } from 'react';
import { Moon, Sun, Timer, BookOpen, Brain, BarChart3, Sparkles, CheckCircle2 } from 'lucide-react';
import Auth from './Auth';

// ============================================================================
// TIPOS
// ============================================================================

interface WelcomePageProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const WelcomePage: React.FC<WelcomePageProps> = ({ theme, toggleTheme }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'register'>('login');

  const isDark = theme === 'dark';

  const handleAuthClick = (mode: 'login' | 'register') => {
    setInitialAuthMode(mode);
    setShowAuth(true);
  };

  // Features destacadas
  const features = [
    {
      icon: Timer,
      title: 'Tecnica Pomodoro',
      description: 'Timer inteligente con sesiones de trabajo y descanso personalizables'
    },
    {
      icon: BookOpen,
      title: 'Gestion Academica',
      description: 'Organiza materias, tareas, examenes y materiales de estudio'
    },
    {
      icon: Brain,
      title: 'Segundo Cerebro',
      description: 'Notas tipo Notion con grafo de conocimiento estilo Obsidian'
    },
    {
      icon: BarChart3,
      title: 'Estadisticas',
      description: 'Visualiza tu productividad y progreso con graficos detallados'
    }
  ];

  // Planes disponibles
  const plans = [
    {
      name: 'Free',
      price: 'Gratis',
      features: ['1 perfil', '5 materias por perfil', 'Estadisticas basicas', 'Timer Pomodoro'],
      highlighted: false
    },
    {
      name: 'Premium',
      price: '$9/mes',
      features: ['Perfiles ilimitados', 'Materias ilimitadas', 'Segundo Cerebro completo', 'Estadisticas avanzadas', 'Soporte prioritario'],
      highlighted: true
    },
    {
      name: 'Lifetime',
      price: '$49',
      features: ['Todo de Premium', 'Pago unico', 'Acceso de por vida', 'Updates futuros incluidos'],
      highlighted: false
    }
  ];

  // ============================================================================
  // RENDER - PAGINA DE AUTENTICACION
  // ============================================================================

  if (showAuth) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${
        isDark ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 text-slate-900'
      }`}>
        {/* Barra superior */}
        <div className="fixed top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Boton volver */}
        <button
          onClick={() => setShowAuth(false)}
          className={`absolute top-8 left-8 px-4 py-2 rounded-xl font-medium transition-all ${
            isDark
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-white text-slate-600 hover:bg-slate-50 shadow-md'
          }`}
        >
          Volver
        </button>

        {/* Toggle tema */}
        <button
          onClick={toggleTheme}
          className={`absolute top-8 right-8 p-4 rounded-full border transition-all ${
            isDark
              ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700'
              : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white shadow-lg'
          }`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Logo pequeno */}
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            PomoSmart
          </h1>
        </div>

        {/* Formulario de autenticacion */}
        <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}>
          <Auth theme={theme} />
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER - PAGINA DE BIENVENIDA
  // ============================================================================

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 text-slate-900'
    }`}>
      {/* Barra superior animada */}
      <div className="fixed top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/50" />

      {/* Particulas de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/2 right-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          PomoSmart
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-full border transition-all ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white shadow-md'
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => handleAuthClick('login')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Iniciar sesion
          </button>

          <button
            onClick={() => handleAuthClick('register')}
            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            Registrarse
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 text-center px-8 py-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8">
          <Sparkles size={16} />
          Tu nuevo centro de comando academico
        </div>

        <h2 className="text-6xl md:text-7xl font-black tracking-tight mb-6">
          Estudia mas{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            inteligente
          </span>
          , no mas duro
        </h2>

        <p className={`text-xl md:text-2xl max-w-3xl mx-auto mb-12 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Combina la tecnica Pomodoro con gestion academica avanzada y un segundo cerebro
          para dominar tu semestre.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => handleAuthClick('register')}
            className="px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-indigo-500/40 transition-all text-lg"
          >
            Comenzar gratis
          </button>

          <button
            onClick={() => handleAuthClick('login')}
            className={`px-8 py-4 rounded-2xl font-bold transition-all text-lg ${
              isDark
                ? 'bg-slate-800 text-white hover:bg-slate-700'
                : 'bg-white text-slate-700 hover:bg-slate-50 shadow-lg'
            }`}
          >
            Ya tengo cuenta
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-8 py-20 max-w-6xl mx-auto">
        <h3 className={`text-center text-3xl font-bold mb-16 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          Todo lo que necesitas para estudiar mejor
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl transition-all hover:scale-105 ${
                isDark
                  ? 'bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50'
                  : 'bg-white/80 shadow-lg hover:shadow-xl'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'
              }`}>
                <feature.icon className="text-indigo-600" size={24} />
              </div>
              <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
              <p className={isDark ? 'text-slate-400 text-sm' : 'text-slate-500 text-sm'}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 px-8 py-20 max-w-5xl mx-auto">
        <h3 className={`text-center text-3xl font-bold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          Planes simples y transparentes
        </h3>
        <p className={`text-center mb-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Comienza gratis y actualiza cuando lo necesites
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`p-8 rounded-3xl transition-all ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white scale-105 shadow-2xl shadow-indigo-500/30'
                  : isDark
                    ? 'bg-slate-900/80 border border-slate-800'
                    : 'bg-white shadow-lg'
              }`}
            >
              <h4 className={`text-xl font-bold mb-2 ${plan.highlighted ? '' : isDark ? 'text-slate-200' : ''}`}>
                {plan.name}
              </h4>
              <p className={`text-4xl font-black mb-6 ${plan.highlighted ? '' : 'text-indigo-600'}`}>
                {plan.price}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-2">
                    <CheckCircle2 size={18} className={plan.highlighted ? 'text-indigo-200' : 'text-indigo-600'} />
                    <span className={plan.highlighted ? 'text-indigo-100' : isDark ? 'text-slate-300' : 'text-slate-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleAuthClick('register')}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  plan.highlighted
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {plan.name === 'Free' ? 'Comenzar gratis' : 'Elegir plan'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 px-8 py-20 text-center">
        <div className={`max-w-3xl mx-auto p-12 rounded-3xl ${
          isDark ? 'bg-slate-900/80 border border-slate-800' : 'bg-white shadow-2xl'
        }`}>
          <h3 className="text-3xl font-bold mb-4">
            Listo para transformar tu forma de estudiar?
          </h3>
          <p className={`mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Unete a miles de estudiantes que ya usan PomoSmart para mejorar su productividad
          </p>
          <button
            onClick={() => handleAuthClick('register')}
            className="px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-indigo-500/40 transition-all text-lg"
          >
            Crear cuenta gratis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 px-8 py-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        <p> 2024 PomoSmart. Hecho con amor para estudiantes.</p>
      </footer>
    </div>
  );
};

export default WelcomePage;
