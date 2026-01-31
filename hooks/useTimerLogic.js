// Timer countdown hook with browser side effects (notification, vibration, audio)

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Play a sequence of oscillator beeps via Web Audio API.
 * Internal helper — not exported.
 */
function playTimerSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const playBeep = (startTime, frequency) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    };

    const now = audioContext.currentTime;
    playBeep(now, 800);
    playBeep(now + 0.5, 900);
    playBeep(now + 1.0, 1000);
  } catch (e) {
    // Web Audio API not supported or failed — silent fallback
  }
}

/**
 * Custom hook that manages a countdown timer with browser side effects.
 *
 * Side effects on completion:
 * - Browser Notification (if permission granted)
 * - Navigator vibration pattern
 * - Web Audio API beep sequence
 * - Base64 audio fallback
 *
 * @param {Object} [options]
 * @param {string} [options.notificationTitle='Egg Timer'] - Notification title
 * @param {string} [options.notificationBody='Your eggs are ready!'] - Notification body
 * @returns {Object} Timer state and control functions
 */
export function useTimerLogic({
  notificationTitle = 'Egg Timer',
  notificationBody = 'Your eggs are ready!',
} = {}) {
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(null);
  const [timerComplete, setTimerComplete] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Refs to keep notification options stable for effects
  const notificationTitleRef = useRef(notificationTitle);
  const notificationBodyRef = useRef(notificationBody);
  notificationTitleRef.current = notificationTitle;
  notificationBodyRef.current = notificationBody;

  // ============ NOTIFICATION PERMISSION CHECK ON MOUNT ============
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'default') {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // ============ COUNTDOWN INTERVAL ============
  useEffect(() => {
    if (!timerActive || timerPaused || timerRemaining === null || timerRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          setTimerComplete(true);
          setTimerActive(false);
          playTimerSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timerPaused]);

  // ============ COMPLETION SIDE EFFECTS ============
  useEffect(() => {
    if (timerRemaining === 0 && !timerActive) {
      // Browser notification
      if (typeof Notification !== 'undefined' && notificationPermission === 'granted') {
        const notification = new Notification(notificationTitleRef.current, {
          body: notificationBodyRef.current,
          tag: 'egg-timer',
          requireInteraction: true,
        });
        setTimeout(() => notification.close(), 10000);
      }

      // Vibrate if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }

      // Audio fallback (always)
      try {
        const audio = new Audio(
          'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApJn+HyvmwhBSuBzvLZiTYIG2m98OScTgwOUKfk8LVkHQc5k9jyzHksBSR3yPDckUALFF+18OqnVRMKSZ/h8r9sIQYsh9Dy2Yk1CBtpvfDknE4MDlCn5PC1ZB0HOpPY8sx5LAUkd8jw3ZFACxRetfDqp1UTCkme4PK/bCEGK4fQ8tmJNQgbab3w5JxODA5Qp+TwtWQdBzqT2PLMeSwFJHfI8N2RQAsUXrXw6qdVEwpJn+Hyv2whBiuH0PLZiTUIG2m98OScTgwOUKfk8LVkHQc6k9jyzHksBSR3yPDdkUALFF618OqnVRMKSZ/h8r9sIQYrh9Dy2Yk1CBtpvfDknE4MDlCn5PC1ZB0HOpPY8sx5LAUkd8jw3ZFACxRet'
        );
        audio.volume = 1.0;
        audio.play().catch(() => {
          // Audio play blocked by browser
        });
      } catch (e) {
        // Audio not supported
      }
    }
  }, [timerRemaining, timerActive, notificationPermission]);

  // ============ CONTROL FUNCTIONS ============

  const startTimer = useCallback(async (durationSeconds) => {
    // Request notification permission if not yet determined
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      } catch (error) {
        setNotificationPermission('denied');
      }
    }

    setTimerRemaining(durationSeconds);
    setTimerPaused(false);
    setTimerComplete(false);
    setTimerActive(true);
  }, []);

  const stopTimer = useCallback(() => {
    setTimerActive(false);
    setTimerPaused(false);
    setTimerRemaining(null);
    setTimerComplete(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerActive((active) => {
      setTimerPaused((paused) => {
        if (active && !paused) return true;
        return paused;
      });
      return active;
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setTimerActive((active) => {
      setTimerPaused((paused) => {
        if (active && paused) return false;
        return paused;
      });
      return active;
    });
  }, []);

  const dismissComplete = useCallback(() => {
    setTimerComplete(false);
    setTimerRemaining(null);
  }, []);

  return {
    timerActive,
    timerPaused,
    timerRemaining,
    timerComplete,
    notificationPermission,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    dismissComplete,
  };
}
