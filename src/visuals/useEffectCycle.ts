import { useEffect, useRef, useState } from 'react';
import { effectDuration, effects, type EffectId } from './effects';

type Playback = { index: number; startedAt: number; cycling: boolean };

export function useEffectCycle() {
  const playback = useRef<Playback>({ index: 0, startedAt: performance.now(), cycling: true });
  const [index, setIndex] = useState(0);
  const [cycling, setCycling] = useState(true);
  const [cycleKey, setCycleKey] = useState(0);

  function select(id: EffectId) {
    const next = effects.findIndex((effect) => effect.id === id);

    playback.current = { index: next, startedAt: performance.now(), cycling: false };
    setIndex(next);
    setCycling(false);
  }

  function toggleCycle() {
    const next = !playback.current.cycling;

    playback.current = { ...playback.current, cycling: next, startedAt: performance.now() };
    setCycling(next);
    setCycleKey((key) => key + 1);
  }

  useEffect(() => {
    if (!cycling) return;

    const advance = () => {
      const { startedAt, index } = playback.current;
      const steps = Math.floor((performance.now() - startedAt) / effectDuration);

      if (!steps) return;

      const next = (index + steps) % effects.length;

      playback.current = { index: next, startedAt: startedAt + steps * effectDuration, cycling };
      setIndex(next);
      setCycleKey((key) => key + 1);
    };

    // Less frequent timers in background tabs can skip multiple effects.
    const timer = window.setInterval(advance, 40);

    return () => window.clearInterval(timer);
  }, [cycling]);

  return { playback, index, cycling, cycleKey, select, toggleCycle };
}
