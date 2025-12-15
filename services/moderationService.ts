// Simple list of common PT-BR offensive terms/roots for demonstration.
// In a production app, use a robust library or API.
const OFFENSIVE_ROOTS = [
  'merda', 'bosta', 'porra', 'caralho', 'pqp', 'puta', 'puto', 
  'carai', 'foder', 'fuder', 'cacete', 'buceta', 'cu', 'otario', 
  'idiota', 'imbecil', 'burro', 'vagabundo'
];

const STORAGE_KEYS = {
  VIOLATIONS: 'lume_violations',
  BAN_EXPIRATION: 'lume_ban_expiration'
};

const MAX_VIOLATIONS = 3;
const BAN_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const sanitizeText = (text: string): { sanitized: string; detected: boolean } => {
  let detected = false;
  const words = text.split(' ');
  
  const sanitizedWords = words.map(word => {
    const lowerWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
    const isOffensive = OFFENSIVE_ROOTS.some(root => lowerWord.includes(root));
    
    if (isOffensive) {
      detected = true;
      return '*'.repeat(word.length);
    }
    return word;
  });

  return {
    sanitized: sanitizedWords.join(' '),
    detected
  };
};

export const registerViolation = (): { isBanned: boolean; remainingStrikes: number } => {
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.VIOLATIONS) || '0', 10);
  const newCount = current + 1;
  
  localStorage.setItem(STORAGE_KEYS.VIOLATIONS, newCount.toString());

  if (newCount >= MAX_VIOLATIONS) {
    const banExpiration = Date.now() + BAN_DURATION_MS;
    localStorage.setItem(STORAGE_KEYS.BAN_EXPIRATION, banExpiration.toString());
    return { isBanned: true, remainingStrikes: 0 };
  }

  return { isBanned: false, remainingStrikes: MAX_VIOLATIONS - newCount };
};

export const checkBanStatus = (): { isBanned: boolean; minutesRemaining: number } => {
  const banExpiration = localStorage.getItem(STORAGE_KEYS.BAN_EXPIRATION);
  
  if (!banExpiration) return { isBanned: false, minutesRemaining: 0 };
  
  const exp = parseInt(banExpiration, 10);
  const now = Date.now();
  
  if (now > exp) {
    // Ban expired
    localStorage.removeItem(STORAGE_KEYS.BAN_EXPIRATION);
    localStorage.setItem(STORAGE_KEYS.VIOLATIONS, '0');
    return { isBanned: false, minutesRemaining: 0 };
  }

  return { 
    isBanned: true, 
    minutesRemaining: Math.ceil((exp - now) / 60000) 
  };
};