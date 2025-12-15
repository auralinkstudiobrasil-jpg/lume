import { DiaryEntry } from '../types';

const STORAGE_KEY = 'lume_diary_entries';

export const getEntries = (): DiaryEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Erro ao ler diário", e);
    return [];
  }
};

export const saveEntry = (entry: DiaryEntry): void => {
  try {
    const entries = getEntries();
    // Add to beginning
    const newEntries = [entry, ...entries];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  } catch (e) {
    console.error("Erro ao salvar no diário (provavelmente cota excedida)", e);
    alert("Não foi possível salvar. O espaço do navegador pode estar cheio.");
  }
};

export const deleteEntry = (id: string): void => {
  try {
    const entries = getEntries();
    const newEntries = entries.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  } catch (e) {
    console.error("Erro ao excluir", e);
  }
};

export const exportEntry = (entry: DiaryEntry) => {
    // Simple export logic (download file)
    const element = document.createElement("a");
    let file: Blob;
    let extension = 'txt';

    if (entry.type === 'draw' || entry.type === 'color' || entry.type === 'shape') {
        // Assume content is base64 image data url
        // Convert base64 to blob
        const byteString = atob(entry.content.split(',')[1]);
        const mimeString = entry.content.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        file = new Blob([ab], {type: mimeString});
        extension = 'png';
    } else if (entry.type === 'audio') {
         // Content is base64 audio
        const byteString = atob(entry.content.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        file = new Blob([ab], {type: 'audio/webm'});
        extension = 'webm';
    } else {
        file = new Blob([entry.content], {type: 'text/plain'});
    }

    element.href = URL.createObjectURL(file);
    element.download = `lume_diario_${new Date(entry.date).toISOString().slice(0,10)}.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};