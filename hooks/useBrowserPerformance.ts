// hooks/useBrowserPerformance.ts
import { useEffect, useState } from 'react';

export function useBrowserPerformance(refreshMs = 3000) {
  const [data, setData] = useState({
    jsHeapUsed: 0,
    jsHeapTotal: 0,
    cpu: 0,
    supported: true
  });

  useEffect(() => {
    let rafId: number;
    let running = true;
    let busyTime = 0;
    let last = performance.now();
    let frames = 0;

    function measureLoop() {
      const now = performance.now();
      const delta = now - last;
      busyTime += Math.max(0, delta - 16.7); // tempo acima do frame ideal
      last = now;
      frames++;
      if (running) rafId = requestAnimationFrame(measureLoop);
    }

    rafId = requestAnimationFrame(measureLoop);

    function update() {
      // RAM
      let jsHeapUsed = 0, jsHeapTotal = 0, supported = true;
      if ((performance as any).memory) {
        jsHeapUsed = (performance as any).memory.usedJSHeapSize;
        jsHeapTotal = (performance as any).memory.totalJSHeapSize;
      } else {
        supported = false;
      }
      // CPU estimado: % do tempo "ocupado" no event loop
      const cpu = Math.min(100, Math.round((busyTime / (refreshMs)) * 100));
      setData({
        jsHeapUsed,
        jsHeapTotal,
        cpu,
        supported
      });
      busyTime = 0;
      frames = 0;
    }

    const interval = setInterval(update, refreshMs);
    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      clearInterval(interval);
    };
  }, [refreshMs]);

  return data;
}
