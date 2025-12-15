import React, { useState, useRef, useEffect } from 'react';
import { DiaryEntry, DiaryMode, CommunityMessage } from '../types';
import { saveEntry, getEntries, deleteEntry, exportEntry } from '../services/diaryService';
import { postToCommunity } from '../services/communityService';
import Lumi from './Lumi';

const COLORS = ['#1e293b', '#64748b', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];

interface DiaryProps {
    userName?: string;
}

const Diary: React.FC<DiaryProps> = ({ userName }) => {
  const [mode, setMode] = useState<DiaryMode>('dashboard');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null);
  
  useEffect(() => {
    if (mode === 'dashboard') {
      setEntries(getEntries());
    }
  }, [mode]);

  // Saves locally
  const handleSave = (entry: DiaryEntry) => {
    saveEntry(entry);
    setMode('dashboard');
  };

  // Saves locally AND shares to community
  const handleShare = (entry: DiaryEntry) => {
    saveEntry(entry); // Ensure it's saved locally first
    
    // Construct Community Message
    const commMsg: CommunityMessage = {
        id: Date.now().toString(),
        author: userName || 'Anônimo',
        avatar: '🎨', // Default avatar for creative shares
        text: (entry.type === 'text' || entry.type === 'guided') ? entry.content : 'Compartilhou um registro do diário.',
        timestamp: Date.now()
    };

    if (entry.type === 'draw' || entry.type === 'color' || entry.type === 'shape') {
        commMsg.image = entry.content; // Content is Base64 Image
        commMsg.text = 'Compartilhou uma arte.';
    } else if (entry.type === 'audio') {
        commMsg.audio = entry.content; // Content is Base64 Audio
        commMsg.text = 'Compartilhou um áudio.';
        commMsg.avatar = '🎙️';
    }

    postToCommunity(commMsg);
    alert("Compartilhado com sucesso na Comunidade!");
    setMode('dashboard');
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if(confirm("Tem certeza que quer apagar este registro? Ele sumirá para sempre.")) {
        deleteEntry(id);
        setEntries(prev => prev.filter(x => x.id !== id));
        if (viewingEntry?.id === id) {
            setViewingEntry(null);
        }
    }
  };

  const handleExport = (entry: DiaryEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    exportEntry(entry);
  };

  // --- VIEWER RENDERER ---
  if (viewingEntry) {
    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <button onClick={() => setViewingEntry(null)} className="text-slate-500 font-medium text-sm flex items-center gap-1">
                    ⬅️ Voltar
                </button>
                <span className="font-bold text-slate-700">
                    {new Date(viewingEntry.date).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                     <button onClick={() => handleExport(viewingEntry)} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg" title="Baixar">
                        ⬇️
                     </button>
                     <button onClick={() => handleDelete(viewingEntry.id)} className="p-2 text-red-600 bg-red-50 rounded-lg" title="Excluir">
                        🗑️
                     </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                {(viewingEntry.type === 'text' || viewingEntry.type === 'guided') && (
                    <div className="w-full max-w-md whitespace-pre-wrap text-slate-700 text-lg leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        {viewingEntry.content}
                    </div>
                )}

                {(viewingEntry.type === 'draw' || viewingEntry.type === 'color' || viewingEntry.type === 'shape') && (
                    <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                        <img src={viewingEntry.content} alt="Diário Visual" className="w-full h-auto" />
                    </div>
                )}

                {viewingEntry.type === 'audio' && (
                    <div className="w-full max-w-md flex flex-col items-center justify-center py-10 gap-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-3xl">🎙️</div>
                        <audio controls src={viewingEntry.content} className="w-full max-w-[250px]" />
                        <p className="text-slate-400 text-sm">Registro de áudio</p>
                    </div>
                )}
            </div>
        </div>
    );
  }

  // --- DASHBOARD RENDERER ---

  if (mode === 'dashboard') {
    return (
      <div className="flex flex-col h-full bg-slate-50/50 p-4 overflow-hidden">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-700">Diário</h2>
          <p className="text-slate-500">Do seu jeito. O que você escreve aqui, fica aqui.</p>
        </div>

        {/* Action Grid - Reorganized */}
        <div className="grid grid-cols-3 gap-3 mb-6">
           {/* Top Row: Verbal/Text */}
           <ModeButton icon="📝" label="Escrever" onClick={() => setMode('text')} color="bg-blue-50 border-blue-100 text-blue-700" />
           <ModeButton icon="🎙️" label="Áudio" onClick={() => setMode('audio')} color="bg-emerald-50 border-emerald-100 text-emerald-700" />
           <ModeButton icon="🕯️" label="Guiado" onClick={() => setMode('guided')} color="bg-slate-100 border-slate-200 text-slate-700" />
           
           {/* Bottom Row: Visual (Centered) */}
           <div className="col-span-3 flex justify-center gap-3">
               <div className="w-[calc(33.33%-0.5rem)]">
                   <ModeButton icon="🖌️" label="Desenhar" onClick={() => setMode('draw')} color="bg-rose-50 border-rose-100 text-rose-700" />
               </div>
               <div className="w-[calc(33.33%-0.5rem)]">
                   <ModeButton icon="🎨" label="Cores" onClick={() => setMode('color')} color="bg-amber-50 border-amber-100 text-amber-700" />
               </div>
           </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-20">
           {entries.length === 0 ? (
             <div className="text-center py-10 opacity-50">
                <Lumi size="sm" silenceMode={true} />
                <p className="mt-4 text-sm">Seu histórico aparecerá aqui.</p>
             </div>
           ) : (
             entries.map(entry => (
               <div 
                key={entry.id} 
                onClick={() => setViewingEntry(entry)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors"
               >
                  <div className="flex items-center gap-4 overflow-hidden">
                     <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 text-xl">
                        {entry.type === 'draw' && '🖌️'}
                        {entry.type === 'text' && '📝'}
                        {entry.type === 'color' && '🎨'}
                        {entry.type === 'shape' && '🔷'}
                        {entry.type === 'audio' && '🎙️'}
                        {entry.type === 'guided' && '🕯️'}
                     </div>
                     <div className="min-w-0">
                        <p className="text-xs text-slate-400 font-medium">
                          {new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(entry.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-slate-700 font-medium truncate text-sm">
                           {entry.type === 'text' || entry.type === 'guided' ? entry.content : 
                            (entry.type === 'audio' ? 'Registro de voz' : 'Registro visual')}
                        </p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={(e) => handleExport(entry, e)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Baixar">
                        ⬇️
                     </button>
                     <button onClick={(e) => handleDelete(entry.id, e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Excluir">
                        🗑️
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    );
  }

  // --- SUB-COMPONENTS FOR MODES ---
  return (
    <div className="h-full flex flex-col bg-white">
       {/* Header for Editor */}
       <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <button onClick={() => setMode('dashboard')} className="text-slate-500 font-medium text-sm flex items-center gap-1">
             ⬅️ Voltar
          </button>
          <span className="font-bold text-slate-700 capitalize">
             {mode === 'draw' && 'Desenhar'}
             {mode === 'text' && 'Escrever'}
             {mode === 'color' && 'Cores'}
             {mode === 'audio' && 'Áudio'}
             {mode === 'guided' && 'Uma coisa só'}
          </span>
          <div className="w-16"></div> {/* Spacer */}
       </div>

       <div className="flex-1 overflow-hidden relative">
          {mode === 'draw' && <DrawEditor onSave={handleSave} onShare={handleShare} />}
          {mode === 'text' && <TextEditor onSave={handleSave} onShare={handleShare} guided={false} />}
          {mode === 'guided' && <TextEditor onSave={handleSave} onShare={handleShare} guided={true} />}
          {mode === 'color' && <ColorEditor onSave={handleSave} onShare={handleShare} />}
          {mode === 'audio' && <AudioEditor onSave={handleSave} onShare={handleShare} />}
       </div>
    </div>
  );
};

const ModeButton: React.FC<{icon: string, label: string, onClick: () => void, color: string}> = ({icon, label, onClick, color}) => (
    <button onClick={onClick} className={`w-full flex flex-col items-center justify-center p-3 rounded-2xl border ${color} hover:brightness-95 transition-all active:scale-95 shadow-sm`}>
        <span className="text-2xl mb-1">{icon}</span>
        <span className="text-xs font-bold">{label}</span>
    </button>
);

// --- EDITORS ---

interface EditorProps {
    onSave: (e: DiaryEntry) => void;
    onShare: (e: DiaryEntry) => void;
}

const DrawEditor: React.FC<EditorProps> = ({onSave, onShare}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('#000000');
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
             canvas.width = canvas.parentElement?.clientWidth || 300;
             canvas.height = canvas.parentElement?.clientHeight || 400;
             const ctx = canvas.getContext('2d');
             if (ctx) {
                 ctx.fillStyle = '#ffffff';
                 ctx.fillRect(0,0, canvas.width, canvas.height);
             }
        }
    }, []);

    const createEntry = (): DiaryEntry | null => {
        if (!canvasRef.current) return null;
        const dataUrl = canvasRef.current.toDataURL('image/png');
        return {
            id: Date.now().toString(),
            date: Date.now(),
            type: 'draw',
            content: dataUrl
        };
    };

    const handleSave = () => {
        const entry = createEntry();
        if(entry) onSave(entry);
    };

    const handleShare = () => {
        const entry = createEntry();
        if(entry) onShare(entry);
    };

    // Drawing Logic (simplified)
    const isDrawing = useRef(false);
    const start = (e: any) => { isDrawing.current = true; draw(e); };
    const stop = () => isDrawing.current = false;
    const draw = (e: any) => {
        if (!isDrawing.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };
    const beginPath = (e: any) => {
         isDrawing.current = true;
         if(!canvasRef.current) return;
         const ctx = canvasRef.current.getContext('2d');
         if(!ctx) return;
         ctx.beginPath();
         draw(e);
    }

    return (
        <div className="flex flex-col h-full">
            <canvas 
                ref={canvasRef}
                className="flex-1 touch-none"
                onMouseDown={beginPath}
                onMouseMove={draw}
                onMouseUp={stop}
                onMouseLeave={stop}
                onTouchStart={beginPath}
                onTouchMove={draw}
                onTouchEnd={stop}
            />
            <div className="p-4 bg-slate-50 border-t flex flex-col gap-4">
                <div className="flex gap-2 justify-center">
                    {COLORS.slice(0, 5).map(c => (
                        <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`} style={{background: c}} />
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSave} className="flex-1 bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold">Salvar</button>
                    <button onClick={handleShare} className="flex-1 bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2">
                        <span>👥</span> Compartilhar
                    </button>
                </div>
            </div>
        </div>
    )
};

const TextEditor: React.FC<EditorProps & {guided: boolean}> = ({onSave, onShare, guided}) => {
    const [text, setText] = useState('');
    const prompt = guided 
        ? ["O que pesou hoje?", "O que foi suportável?", "O que ajudou um pouco?"][Math.floor(Math.random() * 3)]
        : "Se quiser escrever algo...";

    const createEntry = (): DiaryEntry | null => {
        if (!text.trim()) return null;
        return {
            id: Date.now().toString(),
            date: Date.now(),
            type: guided ? 'guided' : 'text',
            content: guided ? `${prompt}\n\n${text}` : text
        };
    };

    return (
        <div className="flex flex-col h-full p-6">
            {guided && <h3 className="text-xl text-indigo-600 font-medium mb-4">{prompt}</h3>}
            <textarea 
                className="flex-1 w-full resize-none outline-none text-lg text-slate-700 placeholder:text-slate-300 bg-transparent"
                placeholder={guided ? "..." : "Uma frase já é suficiente."}
                value={text}
                onChange={e => setText(e.target.value)}
            />
            <div className="mt-4 flex gap-3">
                 <button 
                    onClick={() => { const e = createEntry(); if(e) onSave(e); }} 
                    disabled={!text.trim()} 
                    className="flex-1 bg-slate-200 disabled:opacity-50 text-slate-700 px-6 py-3 rounded-xl font-bold"
                >
                    Guardar
                </button>
                <button 
                    onClick={() => { const e = createEntry(); if(e) onShare(e); }} 
                    disabled={!text.trim()} 
                    className="flex-1 bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                    <span>👥</span> Compartilhar
                </button>
            </div>
        </div>
    );
};

const ColorEditor: React.FC<EditorProps> = ({onSave, onShare}) => {
    const [selectedColors, setSelectedColors] = useState<string[]>([]);

    const toggleColor = (c: string) => {
        if (selectedColors.includes(c)) {
            setSelectedColors(prev => prev.filter(x => x !== c));
        } else {
            if (selectedColors.length < 3) {
                setSelectedColors(prev => [...prev, c]);
            }
        }
    };

    const createEntry = (): DiaryEntry | null => {
        if (selectedColors.length === 0) return null;
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(0,0,300,300);
        const width = 300 / selectedColors.length;
        selectedColors.forEach((c, i) => {
            ctx.fillStyle = c;
            ctx.fillRect(i * width, 0, width, 300);
        });
        
        return {
            id: Date.now().toString(),
            date: Date.now(),
            type: 'color',
            content: canvas.toDataURL()
        };
    };

    return (
        <div className="flex flex-col h-full p-6 items-center justify-center">
            <h3 className="text-slate-500 mb-8">Escolha até 3 cores que representam agora.</h3>
            
            <div className="flex flex-wrap gap-4 justify-center max-w-xs mb-10">
                {COLORS.map(c => (
                    <button 
                        key={c} 
                        onClick={() => toggleColor(c)}
                        className={`w-12 h-12 rounded-full transition-all duration-300 ${selectedColors.includes(c) ? 'scale-110 ring-4 ring-offset-2 ring-indigo-200' : 'hover:scale-105'}`}
                        style={{background: c}}
                    />
                ))}
            </div>

            <div className="h-24 w-full max-w-xs rounded-2xl overflow-hidden flex border border-slate-100 shadow-sm">
                {selectedColors.length === 0 && <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300 text-xs">Vazio</div>}
                {selectedColors.map(c => (
                    <div key={c} style={{background: c}} className="flex-1 h-full" />
                ))}
            </div>

            <div className="mt-8 flex gap-3 w-full max-w-xs">
                <button 
                    onClick={() => { const e = createEntry(); if(e) onSave(e); }} 
                    disabled={selectedColors.length === 0} 
                    className="flex-1 bg-slate-200 disabled:opacity-50 text-slate-700 px-6 py-3 rounded-xl font-bold"
                >
                    Salvar
                </button>
                <button 
                    onClick={() => { const e = createEntry(); if(e) onShare(e); }} 
                    disabled={selectedColors.length === 0} 
                    className="flex-1 bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold"
                >
                    👥
                </button>
            </div>
        </div>
    );
};

const AudioEditor: React.FC<EditorProps> = ({onSave, onShare}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];
            
            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(t => t.stop());
            };
            
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (e) {
            alert("Microfone não disponível.");
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    const createEntry = (cb: (e: DiaryEntry) => void) => {
        if (!audioBlob) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            cb({
                id: Date.now().toString(),
                date: Date.now(),
                type: 'audio',
                content: reader.result as string
            });
        };
        reader.readAsDataURL(audioBlob);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6">
            {!audioBlob ? (
                <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                    <span className="text-4xl">{isRecording ? '⏹️' : '🎙️'}</span>
                </button>
            ) : (
                <div className="flex flex-col items-center gap-6">
                    <div className="bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-2">
                        <span>✅</span> Áudio gravado
                    </div>
                    <button onClick={() => setAudioBlob(null)} className="text-red-500 text-sm underline">Descartar</button>
                    
                    <div className="flex gap-3 w-full max-w-xs">
                        <button onClick={() => createEntry(onSave)} className="flex-1 bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold">Salvar</button>
                        <button onClick={() => createEntry(onShare)} className="flex-1 bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-1">
                             <span>🎙️</span> Compartilhar
                        </button>
                    </div>
                </div>
            )}
            
            <p className="mt-8 text-slate-400 text-center">
                {isRecording ? "Gravando... Respire." : "Você pode falar ou só respirar."}
            </p>
        </div>
    );
};

export default Diary;