import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export function useAutoReload(interval: number) {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalIdRef.current = setInterval(() => {
      router.reload({
        showProgress: false,
      });
    }, interval);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [interval]);
}
