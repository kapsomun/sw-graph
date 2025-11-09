import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('updates the value after the specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'first' } }
    );

    // initially old value
    expect(result.current).toBe('first');

    rerender({ value: 'second' });

    // not yet updated
    expect(result.current).toBe('first');

    // advance timer by 299ms — still no update
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('first');

    // after 300ms it should update
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('second');
  });

  it('resets the timer if value changes before the previous delay finishes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 200),
      { initialProps: { value: 'A' } }
    );

    rerender({ value: 'B' });
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Value changed before debounce finished
    rerender({ value: 'C' });
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // not yet full 200ms for 'C'
    expect(result.current).toBe('A');

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe('C');
  });

  it('works correctly with a custom delayMs', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'x', delay: 1000 } }
    );

    rerender({ value: 'y', delay: 1000 });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('y');
  });
});
