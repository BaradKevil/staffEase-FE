/**
 * ===========================================
 *  Web Audio API Ringtone & Chime Generator
 * ===========================================
 *
 * Generates an authentic, dual-tone workplace ringtone
 * without needing external audio file dependencies.
 */

let ringtoneInterval = null;
let audioCtx = null;

export const playIncomingRingtone = () => {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const triggerDualBeep = () => {
      if (!audioCtx || audioCtx.state === 'closed') return;

      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, now); // 440Hz (A4)
      osc2.frequency.setValueAtTime(480, now); // 480Hz standard supervisory ring

      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.4);
      osc2.stop(now + 1.4);
    };

    triggerDualBeep();
    ringtoneInterval = setInterval(triggerDualBeep, 2800);
  } catch (err) {
    console.warn('Ringtone audio playback error:', err);
  }
};

export const stopRingtone = () => {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
  if (audioCtx) {
    try {
      audioCtx.close();
    } catch {
      // ignore
    }
    audioCtx = null;
  }
};
