type WindowWithWebAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let audioContext: AudioContext | null = null;

export function playTilePress() {
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;
  playTone(context, {
    start: now,
    type: 'triangle',
    from: 520,
    to: 780,
    volume: 0.07,
    duration: 0.12,
  });
}

export function playBlockedMove() {
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;
  playTone(context, {
    start: now,
    type: 'square',
    from: 180,
    to: 115,
    volume: 0.045,
    duration: 0.09,
  });
  playTone(context, {
    start: now + 0.075,
    type: 'square',
    from: 150,
    to: 95,
    volume: 0.035,
    duration: 0.1,
  });
}

type Tone = {
  start: number;
  type: OscillatorType;
  from: number;
  to: number;
  volume: number;
  duration: number;
};

function playTone(context: AudioContext, tone: Tone) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = tone.type;
  oscillator.frequency.setValueAtTime(tone.from, tone.start);
  oscillator.frequency.exponentialRampToValueAtTime(tone.to, tone.start + tone.duration * 0.55);

  gain.gain.setValueAtTime(0.0001, tone.start);
  gain.gain.exponentialRampToValueAtTime(tone.volume, tone.start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, tone.start + tone.duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(tone.start);
  oscillator.stop(tone.start + tone.duration);
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
