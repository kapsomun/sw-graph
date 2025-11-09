import { useEffect, useState } from 'react';

/** Returns a debounced copy of the given value. */
export function useDebouncedValue<T>(value: T, delayMs = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
