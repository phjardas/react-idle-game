import { useEffect, useRef } from 'react';

export function useAnimationFrame(callback) {
  const handle = useRef();

  useEffect(() => {
    function tick(time) {
      callback(time);
      handle.current = window.requestAnimationFrame(tick);
    }

    handle.current = window.requestAnimationFrame(tick);
    return () => {
      handle.current && window.cancelAnimationFrame(handle.current);
    };
  }, [callback]);
}

export function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current(Date.now());
    }

    const handle = setInterval(tick, delay);
    return () => clearInterval(handle);
  }, [delay]);
}
