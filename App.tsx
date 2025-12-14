import React, { useState } from 'react';
import { MoodType, Tab, AppView, UserMode } from './types';
import Lumi from './components/Lumi';
import EmotionalCheckIn from './components/EmotionalCheckIn';
import Acolhimento from './components/BreathingExercise'; 
import MicroRoutines from './components/MicroRoutines';
import NonVerbalDiary from './components/NonVerbalDiary';
import ChatInterface from './components/ChatInterface';
import VideoBackground from './components/VideoBackground';

const App: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
  const [activeTab, setActiveTab] = useState<Tab['id']>('home');
  const [view, setView] = useState<AppView>('welcome');
  const [silenceMode, setSilenceMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [userMode, setUserMode] = useState<UserMode>('base');

  // --- Navigation Logic ---
  
  const handleNameSubmit = () => {
    if (userName.trim()) {
      setView('mode_select');
    }
  };

  const handleModeSelect = (mode: UserMode) => {
    setUserMode(mode);
    if (mode === 'sensory') {
      setSilenceMode(true);
    }
    setView('landing');
  };

  const goToCheckIn = () => {
    setView('checkin');
  };

  const handleMoodSelect = (mood: MoodType) => {
    setCurrentMood(mood);
    setView('content');
    setActiveTab('home');
  };

  const quickActionChat = () => {
    setCurrentMood('neutral'); // Default context
    setView('content');
    setActiveTab('chat');
  };

  const quickActionCalm = () => {
    setCurrentMood('neutral');
    setView('content');
    setActiveTab('acolhimento');
  };

  const quickActionRoutine = () => {
    setCurrentMood('neutral');
    setView('content');
    setActiveTab('home');
  };

  const quickActionSilence = () => {
    setSilenceMode(!silenceMode);
  };

  // --- Renderers ---

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in p-8">
      <div className="mb-10 scale-125">
        <Lumi mood="neutral" silenceMode={false} size="lg" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-700 mb-2 text-center">
        Olá.
      </h1>
      <p className="text-slate-500 mb-8 text-center text-lg">
        Como você gosta de ser chamado?
      </p>
      
      <div className="w-full max-w-xs flex flex-col gap-4">
        <input 
          type="text" 
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
          placeholder="Seu nome"
          className="w-full text-center px-4 py-4 rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-indigo-100 focus:border-indigo-300 focus:outline-none text-slate-700 text-lg shadow-sm placeholder:text-slate-300 transition-colors"
          autoFocus
        />
        
        <button 
          onClick={handleNameSubmit}
          disabled={!userName.trim()}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-md transition-all active:scale-95"
        >
          Continuar
        </button>
      </div>
    </div>
  );

  const renderModeSelect = () => (
    <div className="flex flex-col h-full animate-fade-in p-6 pt-12 overflow-y-auto">
      <h1 className="text-2xl font-bold text-slate-700 mb-2 text-center">
        O que você busca hoje?
      </h1>
      <p className="text-slate-500 mb-8 text-center">
        O app se adapta a você. Sem rótulos.
      </p>

      <div className="space-y-4 max-w-sm mx-auto w-full pb-8">
        <button onClick={() => handleModeSelect('base')} className="w-full text-left p-5 bg-white/80 rounded-3xl border-2 border-slate-100 hover:border-indigo-200 transition-all shadow-sm">
          <span className="text-2xl block mb-2">🌱</span>
          <h3 className="font-bold text-slate-700">Equilíbrio Geral</h3>
          <p className="text-sm text-slate-500 mt-1">Organizar rotina e reduzir estresse.</p>
        </button>

        <button onClick={() => handleModeSelect('sensory')} className="w-full text-left p-5 bg-slate-50/90 rounded-3xl border-2 border-slate-200 hover:border-slate-400 transition-all shadow-sm">
          <span className="text-2xl block mb-2">🔇</span>
          <h3 className="font-bold text-slate-700">Silêncio e Previsibilidade</h3>
          <p className="text-sm text-slate-500 mt-1">Menos estímulos visuais e sonoros.</p>
        </button>

        <button onClick={() => handleModeSelect('focus')} className="w-full text-left p-5 bg-indigo-50/80 rounded-3xl border-2 border-indigo-100 hover:border-indigo-300 transition-all shadow-sm">
          <span className="text-2xl block mb-2">⚡</span>
          <h3 className="font-bold text-slate-700">Foco e Ação</h3>
          <p className="text-sm text-slate-500 mt-1">Tarefas curtas. Um passo de cada vez.</p>
        </button>

        <button onClick={() => handleModeSelect('gentle')} className="w-full text-left p-5 bg-amber-50/80 rounded-3xl border-2 border-amber-100 hover:border-amber-300 transition-all shadow-sm">
          <span className="text-2xl block mb-2">🤍</span>
          <h3 className="font-bold text-slate-700">Acolhimento Leve</h3>
          <p className="text-sm text-slate-500 mt-1">Sem cobranças. Apenas existir.</p>
        </button>
      </div>
    </div>
  );

  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in p-6">
      <div className="mb-6 scale-110">
        <Lumi mood="neutral" silenceMode={silenceMode} size="lg" />
      </div>
      <h1 className="text-2xl font-semibold text-slate-700 mb-2 text-center opacity-90 max-w-xs leading-relaxed drop-shadow-sm">
        {userName ? `Oi, ${userName}.` : 'Oi.'}
      </h1>
      <p className="text-slate-500 mb-8 text-center text-lg">
        Eu tô aqui com você.
      </p>
      
      <div className="grid grid-cols-1 w-full max-w-xs gap-4">
        {/* Highlighted Chat Button */}
        <button onClick={quickActionChat} className="bg-indigo-500 hover:bg-indigo-600 text-white p-5 rounded-2xl text-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3">
          <span className="text-2xl">💬</span> Conversar agora
        </button>

        <button onClick={goToCheckIn} className="bg-white/80 backdrop-blur-md border-2 border-indigo-100 hover:border-indigo-300 p-4 rounded-2xl text-lg font-medium text-slate-700 transition-all shadow-sm active:scale-95">
          Como você tá agora?
        </button>
        
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button onClick={quickActionCalm} className="bg-blue-100/80 hover:bg-blue-200/90 p-4 rounded-2xl text-blue-900 font-medium transition-colors active:scale-95 text-center">
            Calma
          </button>
          <button onClick={quickActionRoutine} className="bg-amber-100/80 hover:bg-amber-200/90 p-4 rounded-2xl text-amber-900 font-medium transition-colors active:scale-95 text-center">
            Rotina
          </button>
        </div>
        
        <button onClick={quickActionSilence} className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-medium transition-colors active:scale-95 mt-2 ${silenceMode ? 'bg-slate-800 text-white' : 'bg-slate-200/80 text-slate-600'}`}>
          <span>{silenceMode ? '🔕' : '🔔'}</span> {silenceMode ? 'Modo Silencioso Ativo' : 'Ativar Silêncio'}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <MicroRoutines mode={userMode} />;
      case 'acolhimento':
        return <Acolhimento silenceMode={silenceMode} userMode={userMode} />;
      case 'diary':
        return <NonVerbalDiary />;
      case 'chat':
        return <ChatInterface silenceMode={silenceMode} contextMood={currentMood || undefined} />; 
      default:
        return <MicroRoutines mode={userMode} />;
    }
  };

  const navigation: Tab[] = [
    { id: 'home', label: 'Início', icon: '✨' },
    { id: 'acolhimento', label: 'Acolher', icon: '🌬️' },
    { id: 'chat', label: 'Lumi', icon: '💬' },
    { id: 'diary', label: 'Diário', icon: '🎨' },
  ];

  return (
    <VideoBackground mode={userMode}>
      <div className={`min-h-screen w-full flex flex-col overflow-hidden`}>
        
        {/* Header */}
        <header className="px-6 py-4 flex justify-between items-center z-50">
          {view !== 'welcome' && view !== 'mode_select' && (
            <button onClick={() => setView('landing')} className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-700 opacity-90 hover:opacity-100 transition drop-shadow-sm group">
               {/* Small Lumi Symbol in Header */}
               <div className="transform scale-50 -ml-2">
                 <Lumi size="sm" mood="neutral" silenceMode={silenceMode} />
               </div>
               <span className="-ml-1">LUME</span>
            </button>
          )}
          
          {view !== 'landing' && view !== 'welcome' && view !== 'mode_select' && (
            <button 
              onClick={() => setSilenceMode(!silenceMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm font-medium backdrop-blur-sm ${
                silenceMode 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'bg-white/60 text-slate-700 border border-white/50 shadow-sm'
              }`}
            >
              {silenceMode ? '🔕' : '🔔'}
            </button>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative max-w-lg mx-auto w-full p-4 overflow-hidden z-10">
          
          {view === 'welcome' && renderWelcome()}
          
          {view === 'mode_select' && renderModeSelect()}

          {view === 'landing' && renderLanding()}
          
          {view === 'checkin' && (
             <EmotionalCheckIn onSelect={handleMoodSelect} />
          )}

          {view === 'content' && (
            <>
               {activeTab === 'home' && currentMood && (
                  <div className="py-2 flex justify-center mb-2 animate-fade-in">
                     <Lumi mood={currentMood} silenceMode={silenceMode} size="sm" />
                  </div>
               )}

               <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden relative animate-slide-up">
                 {renderContent()}
               </div>
            </>
          )}
        </main>

        {/* Bottom Navigation */}
        {view === 'content' && (
          <nav className="bg-white/90 backdrop-blur-lg border-t border-white/50 pb-safe pt-2 px-6 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-50">
            <div className="flex justify-between items-center max-w-lg mx-auto">
              {navigation.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'text-indigo-600 -translate-y-1' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="text-2xl mb-1 filter drop-shadow-sm">{tab.icon}</span>
                  <span className={`text-[10px] uppercase tracking-wide font-bold ${activeTab === tab.id ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </VideoBackground>
  );
};

export default App;