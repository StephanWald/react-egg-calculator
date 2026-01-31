import { useTranslation } from '../useTranslation';
import { CONSISTENCY_OPTIONS } from '../constants';
import { formatTime, formatCountdown, formatTemp } from '../formatters';

/**
 * ResultDisplay - Cooking result display with timer button
 *
 * Displays egg visualization, cooking time, ideal time comparison,
 * temperature drop warning, timer countdown inline display,
 * and start/stop timer button.
 *
 * @param {Object} props
 * @param {number|null} props.cookingTime - Calculated cooking time in minutes
 * @param {number|null} props.idealTime - Ideal cooking time without adjustments
 * @param {number|null} props.tempDrop - Temperature drop in Celsius
 * @param {number|null} props.effectiveTemp - Effective cooking temperature
 * @param {string} props.consistency - Current consistency ID
 * @param {string} props.tempUnit - Temperature display unit ('C' or 'F')
 * @param {boolean} props.timerActive - Whether timer is running
 * @param {number|null} props.timerRemaining - Seconds remaining
 * @param {Function} props.onStartTimer - Start timer callback
 * @param {Function} props.onStopTimer - Stop timer callback
 */
export function ResultDisplay({
  cookingTime,
  idealTime,
  tempDrop,
  effectiveTemp,
  consistency,
  tempUnit,
  timerActive,
  timerRemaining,
  onStartTimer,
  onStopTimer,
}) {
  const { t } = useTranslation();

  const getEggVisualization = () => {
    const yolkSize = consistency === 'soft' ? 45 : consistency === 'medium' ? 40 : consistency === 'hard-medium' ? 35 : 30;
    const yolkColor = CONSISTENCY_OPTIONS.find(c => c.id === consistency)?.color || '#FFD700';

    return (
      <svg viewBox="0 0 100 120" className="w-24 h-32 mx-auto">
        <ellipse cx="50" cy="60" rx="40" ry="50" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="2"/>
        <circle cx="50" cy="65" r={yolkSize} fill={yolkColor} opacity="0.9">
          <animate attributeName="r" values={`${yolkSize};${yolkSize + 2};${yolkSize}`} dur="2s" repeatCount="indefinite"/>
        </circle>
        <ellipse cx="42" cy="58" rx="8" ry="6" fill="white" opacity="0.3"/>
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        {getEggVisualization()}
        <div className="text-center">
          <div className="text-5xl sm:text-6xl font-bold text-amber-600 tabular-nums">
            {formatTime(cookingTime)}
          </div>
          <div className="text-amber-800 mt-1">{t('cookingTime')}</div>
          {idealTime !== null && cookingTime !== null && Math.abs(cookingTime - idealTime) > 0.1 && (
            <div className="text-xs text-gray-500 mt-2">
              ({t('idealCase')}: {formatTime(idealTime)})
            </div>
          )}
        </div>
      </div>

      {/* Temperature Info */}
      {tempDrop !== null && tempDrop > 2 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-center">
          <div className="text-blue-800">
            ⚠️ {t('tempDropWarning')} <span className="font-bold">{tempUnit === 'F' ? Math.round(tempDrop * 9 / 5) : tempDrop}°{tempUnit}</span> {t('tempDropUnit')}
          </div>
          <div className="text-blue-600 text-xs mt-1">
            {t('effectiveTemp')}: ~{formatTemp(effectiveTemp, tempUnit)}
          </div>
        </div>
      )}

      {/* Timer Countdown Display */}
      {timerActive && timerRemaining !== null && (
        <div className="mt-4 p-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg">
          <div className="text-center">
            <div className="text-white text-sm font-medium mb-2">⏱️ {t('timerRemaining')}</div>
            <div className="text-6xl font-bold text-white tabular-nums tracking-wider">
              {formatCountdown(timerRemaining)}
            </div>
          </div>
        </div>
      )}

      {/* Start Timer Button */}
      <button
        onClick={timerActive ? onStopTimer : onStartTimer}
        disabled={!cookingTime && !timerActive}
        className="mt-4 w-full py-3 min-h-[44px] px-6 bg-amber-500 text-white text-lg font-medium rounded-xl shadow-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ⏱️ {timerActive ? t('timerStop') : t('timerStart')}
      </button>
    </div>
  );
}
