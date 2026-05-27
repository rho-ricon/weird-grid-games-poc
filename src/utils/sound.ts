type WindowWithWebAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let audioContext: AudioContext | null = null;

export function playTilePress() {
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(520, now);
  oscillator.frequency.exponentialRampToValueAtTime(780, now + 0.055);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.07, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.12);
}

function getAudioContext() {
  const AudioContextConstructor =
    window.AudioContext || (window as WindowWithWebAudio).webkitAudioContext;

  if (!AudioContextConstructor) return null;

  audioContext ||= new AudioContextConstructor();

  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }

  return audioContext;
}
