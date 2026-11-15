import { RefObject, useCallback, useEffect, useRef } from 'react';
import {
  animate,
  useInView,
  useReducedMotion,
  type AnimationPlaybackControls,
  type AnimationSequence,
} from 'motion/react';

export interface CardTimelineOptions {
  loop?: boolean;
  amount?: number;
}

export function useCardTimeline(
  ref: RefObject<HTMLElement | null>,
  build: (scope: HTMLElement) => AnimationSequence,
  opts: CardTimelineOptions = {}
): { replay: () => void; isStatic: boolean } {
  const reduce = useReducedMotion() ?? false;
  const inView = useInView(ref as RefObject<HTMLElement>, { amount: opts.amount ?? 0.35 });
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const played = useRef(false);

  const play = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    controls.current?.stop();
    controls.current = animate(build(el), {
      repeat: opts.loop ? Infinity : 0,
      repeatDelay: 2.4,
    });
    if (reduce) {
      controls.current.complete();
    }
  }, [build, opts.loop, reduce, ref]);

  useEffect(() => {
    if (inView && !played.current) {
      played.current = true;
      play();
    } else if (inView) {
      controls.current?.play();
    } else {
      controls.current?.pause();
    }
  }, [inView, play]);

  useEffect(() => () => controls.current?.stop(), []);

  return { replay: play, isStatic: reduce };
}

export default useCardTimeline;
