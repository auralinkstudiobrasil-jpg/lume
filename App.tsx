import React, { useState, useEffect } from 'react';
import { MoodType, Tab, AppView, UserMode, UserProfile } from './types';
import Lumi from './components/Lumi';
import EmotionalCheckIn from './components/EmotionalCheckIn';
import Acolhimento from './components/BreathingExercise'; 
import MicroRoutines from './components/MicroRoutines';
import Diary from './components/Diary';
import ChatInterface from './components/ChatInterface';
import CommunityChat from './components/CommunityChat';
import VideoBackground from './components/VideoBackground';
import AuthScreen from './components/AuthScreen';
import UserProfileScreen from './components/UserProfile';
import { getUserProfile, signOutUser } from './services/authService';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  // Global State
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
  const [activeTab, setActiveTab] = useState<Tab['id']>('home');
  const [view, setView] = useState<AppView>('auth'); // Start at Auth
  const [silenceMode, setSilenceMode] = useState(false);
  const [userMode, setUserMode] = useState<UserMode>('base');
  
  // Auth State
  const [isGuest, setIsGuest] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [guestName, setGuestName] = useState('');

  // Check Auth on Mount
  useEffect(() => {
     if(supabase) {
         supabase.auth.getUser().then(async ({data}) => {
             if(data.user) {
                 const profile = await getUserProfile(data.user.id);
                 if(profile) {
                     setUserProfile(profile);
                     setIsGuest(false);
                     setView('landing');
                 }
             }
         });
     }
  }, []);

  // --- Handlers ---

  const handleLoginSuccess = async () => {
      // Fetch profile
      if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const profile = await getUserProfile(user.id);
              setUserProfile(profile);
              setIsGuest(false);
              setView('landing');
          }
      }
  };

  const handleGuestEntry = () => {
      setIsGuest(true);
      setGuestName('Visitante');
      setView('welcome'); // Ask name for local session
  };

  const handleLogout = async () => {
      await signOutUser();
      setIsGuest(true);
      setUserProfile(null);
      setView('auth');
  };

  const handleGuestNameSubmit = (name: string) => {
      setGuestName(name);
      setView('mode_select');
  };

  const handleModeSelect = (mode: UserMode) => {
    setUserMode(mode);
    if (mode === 'sensory') {
      setSilenceMode(true);
    }
    setView('landing');
  };

  // --- Renderers ---

  const renderWelcomeGuest = () => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in p-8">
      <div className="mb-10 scale-125">
        <Lumi mood="neutral" silenceMode={false} size="lg" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-700 mb-2 text-center">
        Olá.
      </h1>
      <p className="text-slate-500 mb-8 text-center text-lg">
        Como posso te chamar hoje?
      </p>
      
      <input 
        type="text" 
        onChange={(e) => setGuestName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleGuestNameSubmit(guestName)}
        placeholder="Seu nome"
        className="w-full max-w-xs text-center px-4 py-4 rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-indigo-100 focus:border-indigo-300 focus:outline-none text-slate-700 text-lg shadow-sm mb-4"
        autoFocus
      />
      
      <button 
        onClick={() => handleGuestNameSubmit(guestName || 'Visitante')}
        className="w-full max-w-xs bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-md transition-all active:scale-95"
      >
        Continuar
      </button>
    </div>
  );

  const renderModeSelect = () => (
    <div className="flex flex-col h-full animate-fade-in p-6 pt-12 overflow-y-auto scrollbar-hide">
      <h1 className="text-2xl font-bold text-slate-700 mb-2 text-center">
        O que você busca hoje?
      </h1>
      <p className="text-slate-500 mb-8 text-center">
        O app se adapta a você.
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
    <div className="flex flex-col items-center justify-center h-full animate-fade-in p-6 overflow-y-auto scrollbar-hide">
      
      {/* User Header if Logged In */}
      {!isGuest && userProfile && (
           <div className="absolute top-16 right-6 flex items-center gap-3 bg-white/40 p-2 pr-4 rounded-full backdrop-blur-md border border-white/50 shadow-sm cursor-pointer" onClick={() => { setView('content'); setActiveTab('profile'); }}>
               <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-slate-200">
                   {userProfile.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full object-cover"/> : <span className="flex items-center justify-center h-full">👤</span>}
               </div>
               <span className="text-sm font-bold text-slate-700">{userProfile.username}</span>
           </div>
      )}

      <div className="mb-6 scale-110 mt-10">
        <Lumi mood="neutral" silenceMode={silenceMode} size="lg" />
      </div>
      <h1 className="text-2xl font-semibold text-slate-700 mb-2 text-center opacity-90 max-w-xs leading-relaxed drop-shadow-sm">
        {isGuest ? `Oi, ${guestName || 'Viajante'}.` : `Oi, ${userProfile?.username || 'Amigo'}.`}
      </h1>
      <p className="text-slate-500 mb-8 text-center text-lg">
        {isGuest ? 'Modo Livre Ativado.' : 'Bom te ver em casa.'}
      </p>
      
      <div className="grid grid-cols-1 w-full max-w-xs gap-4 pb-10">
        <button onClick={() => { setCurrentMood('neutral'); setView('content'); setActiveTab('chat'); }} className="bg-indigo-500 hover:bg-indigo-600 text-white p-5 rounded-2xl text-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3">
          <span className="text-2xl">💬</span> Conversar com Lumi
        </button>
        
        <button onClick={() => { setView('content'); setActiveTab('community'); }} className="bg-white/90 border-2 border-emerald-100 hover:border-emerald-300 text-slate-700 p-4 rounded-2xl text-lg font-medium shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-3">
          <span className="text-2xl">🌿</span> Comunidade {isGuest && '(Bloqueado)'}
        </button>

        <button onClick={() => setView('checkin')} className="bg-white/80 backdrop-blur-md border-2 border-indigo-100 hover:border-indigo-300 p-4 rounded-2xl text-lg font-medium text-slate-700 transition-all shadow-sm active:scale-95">
          Como você tá agora?
        </button>
        
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button onClick={() => { setView('content'); setActiveTab('acolhimento'); }} className="bg-blue-100/80 hover:bg-blue-200/90 p-4 rounded-2xl text-blue-900 font-medium transition-colors active:scale-95 text-center">
            Calma
          </button>
          <button onClick={() => { setView('content'); setActiveTab('home'); }} className="bg-amber-100/80 hover:bg-amber-200/90 p-4 rounded-2xl text-amber-900 font-medium transition-colors active:scale-95 text-center">
            Rotina
          </button>
        </div>
        
        <button onClick={() => setSilenceMode(!silenceMode)} className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-medium transition-colors active:scale-95 mt-2 ${silenceMode ? 'bg-slate-800 text-white' : 'bg-slate-200/80 text-slate-600'}`}>
          <span>{silenceMode ? '🔕' : '🔔'}</span> {silenceMode ? 'Modo Silencioso Ativo' : 'Ativar Silêncio'}
        </button>

        {isGuest && (
            <button onClick={() => setView('auth')} className="mt-4 text-indigo-600 font-bold text-sm underline">
                Faça parte da família! (Cadastro)
            </button>
        )}
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
        return <Diary userName={isGuest ? guestName : userProfile?.username} />;
      case 'chat':
        return <ChatInterface silenceMode={silenceMode} contextMood={currentMood || undefined} userName={isGuest ? guestName : userProfile?.username} />; 
      case 'community':
        return <CommunityChat isGuest={isGuest} onRegisterRequest={() => setView('auth')} />;
      case 'profile':
        return userProfile ? <UserProfileScreen profile={userProfile} isOwnProfile={true} onLogout={handleLogout} /> : <div>Erro ao carregar perfil</div>;
      default:
        return <MicroRoutines mode={userMode} />;
    }
  };

  const navigation: Tab[] = [
    { id: 'home', label: 'Início', icon: '✨' },
    { id: 'acolhimento', label: 'Acolher', icon: '🌬️' },
    { id: 'chat', label: 'Lumi', icon: '💬' },
    { id: 'community', label: 'Família', icon: '🌿' },
    // Show Profile Icon if Logged In, otherwise Diary
    isGuest 
      ? { id: 'diary', label: 'Diário', icon: '📓' }
      : { id: 'profile', label: 'Perfil', icon: '👤' }
  ];

  if (view === 'auth') {
      return (
        <VideoBackground mode="base">
           <div className="h-[100dvh] w-full max-w-lg mx-auto bg-slate-50/30">
               <AuthScreen onLoginSuccess={handleLoginSuccess} onSkip={handleGuestEntry} />
           </div>
        </VideoBackground>
      );
  }

  return (
    <VideoBackground mode={userMode}>
      <div className={`h-[100dvh] w-full flex flex-col overflow-hidden max-w-lg mx-auto bg-slate-50/30`}>
        
        {/* Header */}
        <header className="flex-none px-6 py-4 flex justify-between items-center z-50">
          {view !== 'welcome' && view !== 'mode_select' && (
            <button onClick={() => setView('landing')} className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-700 opacity-90 hover:opacity-100 transition drop-shadow-sm group">
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
        <main className="flex-1 flex flex-col relative w-full px-4 overflow-hidden z-10 pb-2">
          
          {view === 'welcome' && renderWelcomeGuest()}
          
          {view === 'mode_select' && renderModeSelect()}

          {view === 'landing' && renderLanding()}
          
          {view === 'checkin' && (
             <EmotionalCheckIn onSelect={(mood) => { setCurrentMood(mood); setView('content'); setActiveTab('home'); }} />
          )}

          {view === 'content' && (
            <>
               {activeTab === 'home' && currentMood && (
                  <div className="py-2 flex justify-center mb-1 animate-fade-in flex-none">
                     <Lumi mood={currentMood} silenceMode={silenceMode} size="sm" />
                  </div>
               )}

               <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden relative animate-slide-up flex flex-col">
                 {renderContent()}
               </div>
            </>
          )}
        </main>

        {/* Bottom Navigation */}
        {view === 'content' && (
          <nav className="flex-none bg-white/90 backdrop-blur-lg border-t border-white/50 pb-safe pt-2 px-6 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-50">
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
            <div className="h-4 w-full"></div>
          </nav>
        )}
      </div>
    </VideoBackground>
  );
};

export default App;