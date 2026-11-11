/**
 * AURA GASTRONOMY - Unified Web Audio Chime & Mobile Audio Context Unlocker
 * Solves iOS Safari & Android Chrome autoplay policy by managing a shared AudioContext
 * and automatically resuming it on the first user touch/tap gesture.
 */

let sharedAudioContext: AudioContext | null = null;
let isUnlocked = false;

export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioContext = new AudioCtx();
    }
  }
  return sharedAudioContext;
};

/**
 * Automatically unlocks the Web Audio context on the first user interaction
 */
export const initAudioUnlocker = () => {
  if (typeof window === 'undefined' || isUnlocked) return;

  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          isUnlocked = true;
        }).catch(() => { });
      } else if (ctx.state === 'running') {
        isUnlocked = true;
      }
    }
    // Remove listeners once unlocked
    ['touchstart', 'touchend', 'click', 'keydown'].forEach((event) => {
      window.removeEventListener(event, unlock, true);
    });
  };

  ['touchstart', 'touchend', 'click', 'keydown'].forEach((event) => {
    window.addEventListener(event, unlock, { capture: true, once: false, passive: true });
  });
};

/**
 * Play a synthesized dual-tone notification chime (D5 ➔ A5 harmonics)
 * @param volume - Gain level between 0.05 and 0.5 (default: 0.25)
 */
export const playNotificationChime = (volume = 0.25) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => { });
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    // Dual-tone melodic rise: D5 (587.33 Hz) ➔ A5 (880 Hz)
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880, now + 0.12);

    // Smooth envelope with exponential decay
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  } catch (err) {
    // Graceful fallback if audio is not permitted by device
  }
};
