import React from 'react';
import { useTranslation } from '../useTranslation';
import { formatCountdown } from '../formatters';

/**
 * TimerOverlay - Full-screen timer overlay component
 *
 * @param {boolean} timerActive - Whether timer is running
 * @param {boolean} timerComplete - Whether timer finished
 * @param {boolean} timerPaused - Whether timer is paused
 * @param {number} timerRemaining - Seconds remaining
 * @param {function} onPause - Pause callback
 * @param {function} onResume - Resume callback
 * @param {function} onStop - Stop callback
 * @param {function} onDismiss - Dismiss complete callback
 */
export const TimerOverlay = ({
  timerActive,
  timerComplete,
  timerPaused,
  timerRemaining,
  onPause,
  onResume,
  onStop,
  onDismiss,
}) => {
  const { t } = useTranslation();

  React.useEffect(() => {
    if (timerActive || timerComplete) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [timerActive, timerComplete]);

  if (!timerActive && !timerComplete) return null;

  return (
    <>
      {/* Backdrop - does NOT close on click (unlike config dialog) */}
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50" />
      {/* Timer Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm text-center">
          {timerComplete ? (
            <>
              {/* Timer Complete State */}
              <div className="text-6xl mb-4">🥚</div>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">{t('timerComplete')}</h2>
              <p className="text-gray-600 mb-6">{t('notificationBody')}</p>
              <button
                onClick={onDismiss}
                className="w-full py-4 min-h-[56px] px-6 bg-amber-500 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-amber-600 active:scale-95 transition-all"
              >
                ✓ {t('timerDismiss')}
              </button>
            </>
          ) : (
            <>
              {/* Timer Running State */}
              <div className="text-white text-sm font-medium mb-2 text-amber-600">⏱️ {t('timerRemaining')}</div>
              <div className="text-6xl sm:text-7xl font-bold text-amber-900 tabular-nums tracking-wider mb-6 sm:mb-8">
                {formatCountdown(timerRemaining)}
              </div>

              {/* Timer Controls */}
              <div className="flex gap-3">
                {/* Pause/Resume Button */}
                <button
                  onClick={timerPaused ? onResume : onPause}
                  className={`flex-1 py-4 min-h-[56px] px-4 sm:px-6 text-base sm:text-lg font-bold rounded-xl shadow-lg transition-all active:scale-95 ${
                    timerPaused
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {timerPaused ? `▶ ${t('timerResume')}` : `⏸ ${t('timerPause')}`}
                </button>

                {/* Stop Button */}
                <button
                  onClick={onStop}
                  className="flex-1 py-4 min-h-[56px] px-4 sm:px-6 bg-red-500 text-white text-base sm:text-lg font-bold rounded-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                >
                  ⏹ {t('timerStop')}
                </button>
              </div>

              {/* Paused indicator */}
              {timerPaused && (
                <div className="mt-4 text-amber-600 font-medium animate-pulse">
                  ⏸ {t('timerPause')}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
