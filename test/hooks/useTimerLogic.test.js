import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimerLogic } from '../../hooks/useTimerLogic';

describe('useTimerLogic', () => {
  let mockNotificationInstance;

  beforeEach(() => {
    vi.useFakeTimers();

    // Mock Notification API — must use a real class so `new Notification()` works
    mockNotificationInstance = { close: vi.fn() };
    class MockNotification {
      constructor(title, options) {
        MockNotification._calls.push({ title, options });
        Object.assign(this, mockNotificationInstance);
      }
    }
    MockNotification._calls = [];
    MockNotification.permission = 'default';
    MockNotification.requestPermission = vi.fn().mockResolvedValue('granted');
    global.Notification = MockNotification;

    // Mock AudioContext — use real class so `new AudioContext()` works
    global.AudioContext = class MockAudioContext {
      constructor() {
        this.currentTime = 0;
        this.destination = {};
      }
      createOscillator() {
        return {
          connect: vi.fn(),
          frequency: { value: 0 },
          type: '',
          start: vi.fn(),
          stop: vi.fn(),
        };
      }
      createGain() {
        return {
          connect: vi.fn(),
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
        };
      }
    };

    // Mock Audio constructor for base64 fallback — use real class
    global.Audio = class MockAudio {
      constructor() {
        this.volume = 1.0;
      }
      play() {
        return Promise.resolve();
      }
    };

    // Mock navigator.vibrate
    navigator.vibrate = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete global.Notification;
    delete global.AudioContext;
    delete global.Audio;
  });

  it('starts with inactive timer', () => {
    const { result } = renderHook(() => useTimerLogic());
    expect(result.current.timerActive).toBe(false);
    expect(result.current.timerPaused).toBe(false);
    expect(result.current.timerRemaining).toBeNull();
    expect(result.current.timerComplete).toBe(false);
  });

  it('startTimer sets active=true and remaining to given seconds', async () => {
    const { result } = renderHook(() => useTimerLogic());
    await act(async () => {
      await result.current.startTimer(300);
    });
    expect(result.current.timerActive).toBe(true);
    expect(result.current.timerRemaining).toBe(300);
    expect(result.current.timerPaused).toBe(false);
    expect(result.current.timerComplete).toBe(false);
  });

  it('counts down by 1 each second', async () => {
    const { result } = renderHook(() => useTimerLogic());
    await act(async () => {
      await result.current.startTimer(10);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(result.current.timerRemaining).toBe(9);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(result.current.timerRemaining).toBe(8);
  });

  it('completes when reaching zero', async () => {
    const { result } = renderHook(() => useTimerLogic());
    await act(async () => {
      await result.current.startTimer(2);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(result.current.timerComplete).toBe(true);
    expect(result.current.timerActive).toBe(false);
    expect(result.current.timerRemaining).toBe(0);
  });

  it('pauses countdown (remaining unchanged during paused time)', async () => {
    const { result } = renderHook(() => useTimerLogic());
    await act(async () => {
      await result.current.startTimer(10);
    });

    // Count down 2 seconds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(result.current.timerRemaining).toBe(8);

    // Pause
    act(() => {
      result.current.pauseTimer();
    });
    expect(result.current.timerPaused).toBe(true);

    // Advance 5 seconds while paused
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(result.current.timerRemaining).toBe(8); // Unchanged
  });

  it('resumes countdown after pause', async () => {
    const { result } = renderHook(() => useTimerLogic());
    await act(async () => {
      await result.current.startTimer(10);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(result.current.timerRemaining).toBe(8);

    // Pause then resume
    act(() => {
      result.current.pauseTimer();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(result.current.timerRemaining).toBe(8); // Still paused

    act(() => {
      result.current.resumeTimer();
    });
    expect(result.current.timerPaused).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(result.current.timerRemaining).toBe(7);
  });

  it('stopTimer resets all state', async () => {
    const { result } = renderHook(() => useTimerLogic());
    await act(async () => {
      await result.current.startTimer(300);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    act(() => {
      result.current.stopTimer();
    });
    expect(result.current.timerActive).toBe(false);
    expect(result.current.timerPaused).toBe(false);
    expect(result.current.timerRemaining).toBeNull();
    expect(result.current.timerComplete).toBe(false);
  });

  it('dismissComplete clears complete state', async () => {
    const { result } = renderHook(() => useTimerLogic());
    await act(async () => {
      await result.current.startTimer(1);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(result.current.timerComplete).toBe(true);

    act(() => {
      result.current.dismissComplete();
    });
    expect(result.current.timerComplete).toBe(false);
    expect(result.current.timerRemaining).toBeNull();
  });

  it('triggers Notification on completion when permission granted', async () => {
    global.Notification.permission = 'granted';
    const { result } = renderHook(() => useTimerLogic());

    // Manually sync permission since permission was already granted
    // The hook reads it on mount
    await act(async () => {
      await result.current.startTimer(1);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // The completion effect fires — check Notification was constructed
    expect(global.Notification._calls.length).toBeGreaterThan(0);
  });

  it('triggers navigator.vibrate on completion', async () => {
    global.Notification.permission = 'granted';
    const { result } = renderHook(() => useTimerLogic());

    await act(async () => {
      await result.current.startTimer(1);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(navigator.vibrate).toHaveBeenCalledWith([200, 100, 200, 100, 200]);
  });

  it('does not throw when Notification and AudioContext are not available', async () => {
    delete global.Notification;
    delete global.AudioContext;
    delete global.Audio;

    const { result } = renderHook(() => useTimerLogic());
    await act(async () => {
      await result.current.startTimer(1);
    });

    // Should not throw
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(result.current.timerComplete).toBe(true);
  });

  it('requests notification permission on first startTimer', async () => {
    global.Notification.permission = 'default';
    const { result } = renderHook(() => useTimerLogic());

    await act(async () => {
      await result.current.startTimer(300);
    });

    expect(global.Notification.requestPermission).toHaveBeenCalled();
    expect(result.current.notificationPermission).toBe('granted');
  });

  it('accepts custom notification title and body', async () => {
    global.Notification.permission = 'granted';
    const { result } = renderHook(() =>
      useTimerLogic({
        notificationTitle: 'Custom Title',
        notificationBody: 'Custom Body',
      })
    );

    await act(async () => {
      await result.current.startTimer(1);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(global.Notification._calls.length).toBeGreaterThan(0);
    const call = global.Notification._calls[0];
    expect(call.title).toBe('Custom Title');
    expect(call.options.body).toBe('Custom Body');
  });
});
