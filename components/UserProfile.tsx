import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { updateUserProfile } from '../services/authService';
import Lumi from './Lumi';

interface UserProfileProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onLogout: () => void;
}

const UserProfileScreen: React.FC<UserProfileProps> = ({ profile, isOwnProfile, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'gallery' | 'music'>('about');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sync state if prop changes
  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  const handleSave = async () => {
    try {
        await updateUserProfile(profile.id, {
            bio: editedProfile.bio,
            avatar_url: editedProfile.avatar_url,
            cover_url: editedProfile.cover_url
        });
        setIsEditing(false);
        // Em um app real, precisariamos recarregar o perfil pai ou usar contexto
        alert("Perfil atualizado!");
    } catch (e) {
        alert("Erro ao atualizar.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar_url' | 'cover_url') => {
      const file = e.target.files?.[0];
      if(file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditedProfile(prev => ({...prev, [field]: reader.result as string}));
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto scrollbar-hide">
      
      {/* Cover Image Area */}
      <div className="relative w-full h-48 bg-slate-300 overflow-hidden flex-none group">
         {editedProfile.cover_url ? (
             <img src={editedProfile.cover_url} alt="Cover" className="w-full h-full object-cover" />
         ) : (
             <div className="w-full h-full bg-gradient-to-r from-indigo-400 to-purple-400"></div>
         )}
         
         {/* Edit Cover Button */}
         {isEditing && (
             <button 
               onClick={() => coverInputRef.current?.click()}
               className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70"
             >
                📷 <span className="text-xs ml-1">Alterar Capa</span>
             </button>
         )}
         <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover_url')} />
      </div>

      {/* Profile Header Info (Overlapping) */}
      <div className="px-6 relative flex-none">
         <div className="flex justify-between items-end -mt-12 mb-4">
             {/* Avatar */}
             <div className="relative">
                 <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
                     {editedProfile.avatar_url ? (
                         <img src={editedProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center bg-slate-100 text-3xl">👤</div>
                     )}
                 </div>
                 {isEditing && (
                     <button 
                       onClick={() => avatarInputRef.current?.click()}
                       className="absolute bottom-0 right-0 bg-indigo-500 text-white rounded-full p-1.5 border-2 border-white"
                     >
                        ✏️
                     </button>
                 )}
                 <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar_url')} />
             </div>

             {/* Action Buttons */}
             <div className="flex gap-2 mb-2">
                 {isOwnProfile && !isEditing && (
                     <button onClick={() => setIsEditing(true)} className="bg-white border border-slate-200 text-slate-700 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm hover:bg-slate-50">
                         Editar Perfil
                     </button>
                 )}
                 {isOwnProfile && isEditing && (
                     <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                         Salvar
                     </button>
                 )}
                 {isOwnProfile && (
                     <button onClick={onLogout} className="bg-red-50 border border-red-100 text-red-600 px-3 py-1.5 rounded-full text-sm font-semibold">
                         Sair
                     </button>
                 )}
             </div>
         </div>

         <div className="mb-6">
             <h1 className="text-2xl font-bold text-slate-800">{editedProfile.username}</h1>
             <div className="flex items-center gap-2 mt-1">
                 <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-md tracking-wide">
                     {editedProfile.personality}
                 </span>
                 <span className="text-slate-400 text-xs">• {editedProfile.age} anos</span>
             </div>
             
             {isEditing ? (
                 <textarea 
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile(prev => ({...prev, bio: e.target.value}))}
                    className="w-full mt-3 p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-indigo-400"
                    placeholder="Escreva algo sobre você..."
                 />
             ) : (
                 <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                     {editedProfile.bio || "Sem biografia ainda."}
                 </p>
             )}
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-6 gap-6 flex-none">
          {['about', 'gallery', 'music'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-3 text-sm font-bold transition-all ${
                    activeTab === tab 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                  {tab === 'about' && 'Sobre'}
                  {tab === 'gallery' && 'Galeria'}
                  {tab === 'music' && 'Músicas/Vídeos'}
              </button>
          ))}
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 bg-white">
          {activeTab === 'about' && (
              <div className="space-y-4 animate-fade-in">
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-50">
                      <h3 className="text-xs font-bold text-indigo-400 uppercase mb-2">Conquistas</h3>
                      <div className="flex gap-2">
                          <span className="text-2xl" title="Membro Fundador">🏅</span>
                          <span className="text-2xl" title="Diário Ativo">📔</span>
                          <span className="text-2xl" title="Comunidade">🌿</span>
                      </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Status</h3>
                      <div className="flex items-center gap-2">
                          <Lumi size="sm" mood="happy" silenceMode={false} />
                          <p className="text-sm text-slate-600">Lume está ativo e iluminando este perfil.</p>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'gallery' && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                  {/* Placeholder for Gallery functionality */}
                  <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200">
                      <span className="text-2xl text-slate-300">📷</span>
                  </div>
                  <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center">
                      <span className="text-xs text-slate-400">Vazio</span>
                  </div>
              </div>
          )}

          {activeTab === 'music' && (
              <div className="space-y-3 animate-fade-in">
                   {/* Decorative placeholders for modern social feel */}
                   <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-500">🎵</div>
                       <div>
                           <p className="text-sm font-bold text-slate-700">Música Favorita</p>
                           <p className="text-xs text-slate-400">Lo-fi Beats para relaxar</p>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">📺</div>
                       <div>
                           <p className="text-sm font-bold text-slate-700">Vídeo de Foco</p>
                           <p className="text-xs text-slate-400">Natureza 4K</p>
                       </div>
                   </div>

                   <button className="w-full py-3 text-xs font-bold text-slate-400 border border-dashed border-slate-300 rounded-xl hover:bg-slate-50">
                       + Adicionar Link
                   </button>
              </div>
          )}
      </div>
    </div>
  );
};

export default UserProfileScreen;