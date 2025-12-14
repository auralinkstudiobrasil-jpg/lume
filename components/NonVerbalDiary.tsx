import React, { useRef, useState, useEffect } from 'react';

const colors = ['#000000', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

const NonVerbalDiary: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Resize canvas
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        const ctx = canvas.getContext('2d');
        if(ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0,0, canvas.width, canvas.height);
        }
    }
  }, [savedMessage]); // Re-init on save to clear

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if(savedMessage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || savedMessage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleSave = () => {
    setSavedMessage("Obrigada por me mostrar. Guardei com carinho.");
    setTimeout(() => {
      setSavedMessage(null); // Reset after delay
    }, 3000);
  };

  if (savedMessage) {
     return (
       <div className="flex flex-col h-full bg-white rounded-2xl items-center justify-center p-8 animate-fade-in border border-slate-100">
          <LumiPlaceholder />
          <p className="text-xl text-slate-700 font-medium text-center mt-6">{savedMessage}</p>
       </div>
     );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="text-slate-700 font-semibold">Sem palavras</h3>
        <button 
          onClick={handleSave} 
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-full transition-colors"
        >
          Guardar
        </button>
      </div>
      
      <div className="flex-1 relative cursor-crosshair touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full"
        />
      </div>

      <div className="p-3 border-t border-slate-100 bg-slate-50 overflow-x-auto">
        <div className="flex gap-3 justify-center">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === color ? 'scale-110 border-slate-800' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const LumiPlaceholder = () => (
  <div className="w-16 h-16 bg-amber-100 rounded-full animate-pulse shadow-lg"></div>
);

export default NonVerbalDiary;