import { useEffect, useRef } from 'react';

/**
 * Hook para focar automaticamente um input ao montar o componente.
 * Uso: const inputRef = useAutoFocus<HTMLInputElement>();
 * <input ref={inputRef} ... />
 */
export function useAutoFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return ref;
}
