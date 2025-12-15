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
      setView('welcome');
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
      <div className="mb-8 scale-110">
        <Lumi mood="neutral" silenceMode={false} size="lg" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">
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
        className="w-full max-w-xs text-center px-4 py-4 rounded-2xl bg-white/80 backdrop-blur-lg border border-white/50 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 text-slate-700 text-lg shadow-lg mb-4"
        autoFocus
      />
      
      <button 
        onClick={() => handleGuestNameSubmit(guestName || 'Visitante')}
        className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-95"
      >
        Continuar
      </button>
    </div>
  );

  const renderModeSelect = () => (
    <div className="flex flex-col h-full animate-fade-in p-6 pt-12 overflow-y-auto scrollbar-hide">
      <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">
        O que você busca hoje?
      </h1>
      <p className="text-slate-500 mb-8 text-center">
        O app se adapta a você.
      </p>

      <div className="space-y-4 max-w-sm mx-auto w-full pb-8">
        {[
            { id: 'base', icon: '🌱', title: 'Equilíbrio Geral', desc: 'Organizar rotina e reduzir estresse.', color: 'border-slate-200 bg-white/90' },
            { id: 'sensory', icon: '🔇', title: 'Silêncio', desc: 'Menos estímulos visuais e sonoros.', color: 'border-slate-200 bg-slate-100/90' },
            { id: 'focus', icon: '⚡', title: 'Foco e Ação', desc: 'Tarefas curtas. Um passo de cada vez.', color: 'border-indigo-100 bg-indigo-50/90' },
            { id: 'gentle', icon: '🤍', title: 'Acolhimento', desc: 'Sem cobranças. Apenas existir.', color: 'border-amber-100 bg-amber-50/90' },
        ].map((item) => (
             <button 
                key={item.id}
                onClick={() => handleModeSelect(item.id as UserMode)} 
                className={`w-full text-left p-5 rounded-3xl border-2 hover:scale-[1.02] transition-all shadow-sm flex items-center gap-4 ${item.color}`}
            >
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                    <h3 className="font-bold text-slate-700">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5 leading-tight">{item.desc}</p>
                </div>
            </button>
        ))}
      </div>
    </div>
  );

  const renderLanding = () => (
    <div className="flex flex-col items-center h-full animate-fade-in px-6 py-2 overflow-y-auto scrollbar-hide">
      
      {/* User Avatar - Floating */}
      {!isGuest && userProfile && (
           <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/60 p-1.5 pr-3 rounded-full backdrop-blur-md border border-white/40 shadow-sm cursor-pointer hover:bg-white/80 transition-all" onClick={() => { setView('content'); setActiveTab('profile'); }}>
               <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-slate-200 shadow-sm">
                   {userProfile.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full object-cover"/> : <span className="flex items-center justify-center h-full text-sm">👤</span>}
               </div>
               <span className="text-xs font-bold text-slate-700">{userProfile.username.split(' ')[0]}</span>
           </div>
      )}

      {/* Mascot Area - Centralized */}
      <div className="flex-none mt-6 mb-4 transform transition-transform">
        <Lumi mood="neutral" silenceMode={silenceMode} size="lg" />
      </div>

      <h1 className="text-2xl font-bold text-slate-800 mb-1 text-center opacity-90 leading-tight">
        {isGuest ? `Oi, ${guestName || 'Viajante'}.` : `Oi, ${userProfile?.username.split(' ')[0] || 'Amigo'}.`}
      </h1>
      <p className="text-slate-500 mb-8 text-center text-sm font-medium">
        {isGuest ? 'Modo Livre Ativado.' : 'Bom te ver em casa.'}
      </p>
      
      {/* Main Action Grid */}
      <div className="w-full max-w-xs space-y-3 pb-8">
        
        {/* Chat Button - Primary */}
        <button 
            onClick={() => { setCurrentMood('neutral'); setView('content'); setActiveTab('chat'); }} 
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:to-indigo-700 text-white p-4 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
              <span className="text-2xl bg-white/20 p-2 rounded-xl">💬</span>
              <span>Falar com Lumi</span>
          </div>
          <span className="opacity-60 group-hover:translate-x-1 transition-transform">→</span>
        </button>
        
        {/* Secondary Grid */}
        <div className="grid grid-cols-2 gap-3">
             <button onClick={() => setView('checkin')} className="bg-white/70 backdrop-blur-md border border-white/60 hover:bg-white p-4 rounded-2xl font-bold text-slate-700 shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-1">
                <span className="text-2xl">😊</span>
                <span className="text-xs">Check-in</span>
             </button>

             <button onClick={() => { setView('content'); setActiveTab('community'); }} className="bg-white/70 backdrop-blur-md border border-white/60 hover:bg-white p-4 rounded-2xl font-bold text-slate-700 shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-1 relative overflow-hidden">
                <span className="text-2xl">🌿</span>
                <span className="text-xs">Comunidade</span>
                {isGuest && <div className="absolute inset-0 bg-slate-100/50 flex items-center justify-center backdrop-blur-[1px]"><span className="text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded-full">Bloqueado</span></div>}
             </button>
        </div>

        {/* Quick Tools */}
        <div className="bg-white/40 backdrop-blur-md p-1 rounded-2xl border border-white/30 grid grid-cols-2 gap-1">
             <button onClick={() => { setView('content'); setActiveTab('acolhimento'); }} className="hover:bg-white/60 p-3 rounded-xl text-slate-700 text-sm font-semibold transition-all">
                🌬️ Acolher
             </button>
             <button onClick={() => { setView('content'); setActiveTab('home'); }} className="hover:bg-white/60 p-3 rounded-xl text-slate-700 text-sm font-semibold transition-all">
                ✨ Rotina
             </button>
        </div>
        
        {/* Silence Toggle */}
        <button onClick={() => setSilenceMode(!silenceMode)} className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold transition-all active:scale-95 border ${silenceMode ? 'bg-slate-800 text-white border-slate-800' : 'bg-transparent border-slate-300/50 text-slate-500'}`}>
          <span>{silenceMode ? '🔕' : '🔔'}</span> {silenceMode ? 'Modo Silencioso' : 'Ativar Silêncio'}
        </button>

        {isGuest && (
            <button onClick={() => setView('auth')} className="w-full py-2 text-indigo-600 font-bold text-xs hover:underline opacity-80">
                Faça parte da família (Login/Cadastro)
            </button>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <MicroRoutines mode={userMode} />;
      case 'acolhimento': return <Acolhimento silenceMode={silenceMode} userMode={userMode} />;
      case 'diary': return <Diary userName={isGuest ? guestName : userProfile?.username} />;
      case 'chat': return <ChatInterface silenceMode={silenceMode} contextMood={currentMood || undefined} userName={isGuest ? guestName : userProfile?.username} />; 
      case 'community': return <CommunityChat isGuest={isGuest} onRegisterRequest={() => setView('auth')} />;
      case 'profile': return userProfile ? <UserProfileScreen profile={userProfile} isOwnProfile={true} onLogout={handleLogout} /> : <div>Erro ao carregar perfil</div>;
      default: return <MicroRoutines mode={userMode} />;
    }
  };

  const navigation: Tab[] = [
    { id: 'home', label: 'Início', icon: '✨' },
    { id: 'acolhimento', label: 'Acolher', icon: '🌬️' },
    { id: 'chat', label: 'Lumi', icon: '💬' },
    { id: 'community', label: 'Família', icon: '🌿' },
    isGuest 
      ? { id: 'diary', label: 'Diário', icon: '📓' }
      : { id: 'profile', label: 'Perfil', icon: '👤' }
  ];

  if (view === 'auth') {
      return (
        <VideoBackground mode="base">
           <div className="h-[100dvh] w-full max-w-lg mx-auto bg-slate-50/30 backdrop-blur-sm">
               <AuthScreen onLoginSuccess={handleLoginSuccess} onSkip={handleGuestEntry} />
           </div>
        </VideoBackground>
      );
  }

  return (
    <VideoBackground mode={userMode}>
      <div className={`h-[100dvh] w-full flex flex-col overflow-hidden max-w-lg mx-auto bg-white/10`}>
        
        {/* Header Compacto - Apenas visível nas telas internas de conteúdo */}
        {view === 'content' && (
            <header className="flex-none pt-safe-top px-4 pb-2 flex justify-between items-center z-50">
            <button onClick={() => setView('landing')} className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-md rounded-full border border-white/50 text-slate-700 font-bold text-sm shadow-sm hover:bg-white/80 transition-all">
                <span className="text-xs">⬅</span> Voltar
            </button>
            
            <button 
                onClick={() => setSilenceMode(!silenceMode)}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all text-sm font-medium backdrop-blur-md ${
                silenceMode 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'bg-white/60 text-slate-700 border border-white/50 shadow-sm'
                }`}
            >
                {silenceMode ? '🔕' : '🔔'}
            </button>
            </header>
        )}

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
                  <div className="py-1 flex justify-center mb-1 animate-fade-in flex-none">
                     <Lumi mood={currentMood} silenceMode={silenceMode} size="sm" />
                  </div>
               )}

               <div className="flex-1 bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/60 overflow-hidden relative animate-slide-up flex flex-col">
                 {renderContent()}
               </div>
            </>
          )}
        </main>

        {/* Bottom Navigation Modernized */}
        {view === 'content' && (
          <nav className="flex-none bg-white/80 backdrop-blur-xl border-t border-white/50 pb-safe pt-2 px-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50 rounded-t-3xl mx-2 mb-2">
            <div className="flex justify-between items-center max-w-sm mx-auto">
              {navigation.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center p-2 rounded-2xl transition-all duration-300 ${
                    activeTab === tab.id 
                      ? '-translate-y-1' 
                      : 'hover:bg-slate-100/50'
                  }`}
                >
                  <span className={`text-2xl mb-1 filter drop-shadow-sm transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'scale-100 grayscale-[0.5] opacity-70'}`}>
                      {tab.icon}
                  </span>
                  {activeTab === tab.id && (
                      <span className="absolute -bottom-1 w-1 h-1 bg-indigo-500 rounded-full"></span>
                  )}
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