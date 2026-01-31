import { useTranslation } from '../useTranslation';
import { EGG_SIZES, START_TEMP_OPTIONS } from '../constants';
import { formatTemp, formatVolume, formatWeight } from '../formatters';

/**
 * EggInputs - Egg parameter input controls component
 *
 * Displays egg count buttons, water volume slider, egg size selection
 * (quick buttons + custom slider), and start temperature options.
 *
 * @param {Object} props
 * @param {number} props.eggCount - Current egg count
 * @param {number} props.waterVolume - Current water volume in liters
 * @param {number} props.weight - Current egg weight in grams
 * @param {number} props.startTemp - Current start temperature in Celsius
 * @param {string} props.tempUnit - Temperature display unit ('C' or 'F')
 * @param {string} props.volumeUnit - Volume display unit ('L' or 'oz')
 * @param {string} props.weightUnit - Weight display unit ('g' or 'oz')
 * @param {Function} props.onEggCountChange - Callback with count number
 * @param {Function} props.onWaterVolumeChange - Callback with volume number
 * @param {Function} props.onWeightChange - Callback with weight number
 * @param {Function} props.onStartTempChange - Callback with temp number
 */
export function EggInputs({
  eggCount,
  waterVolume,
  weight,
  startTemp,
  tempUnit,
  volumeUnit,
  weightUnit,
  onEggCountChange,
  onWaterVolumeChange,
  onWeightChange,
  onStartTempChange,
}) {
  const { t } = useTranslation();

  return (
    <>
      {/* Egg Count & Water Volume */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('eggCount')}: <span className="font-bold text-amber-600">{eggCount}</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                onClick={() => onEggCountChange(n)}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  eggCount === n
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('waterVolume')}: <span className="font-bold text-amber-600">{formatVolume(waterVolume, volumeUnit)}</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={waterVolume}
            onChange={(e) => onWaterVolumeChange(Number(e.target.value))}
            className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-3"
          />
        </div>
      </div>

      {/* Egg Size */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('eggSize')}: <span className="font-bold text-amber-600">{formatWeight(weight, weightUnit)}</span>
        </label>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {EGG_SIZES.map((size) => (
            <button
              key={size.name}
              onClick={() => onWeightChange(size.weight)}
              className={`p-2 rounded-lg border-2 transition-all text-center ${
                weight === size.weight
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <div className="font-bold">{size.name}</div>
              <div className="text-xs text-gray-500">{formatWeight(size.weight, weightUnit)}</div>
            </button>
          ))}
        </div>
        <input
          type="range"
          min="40"
          max="90"
          value={weight}
          onChange={(e) => onWeightChange(Number(e.target.value))}
          className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      {/* Start Temperature */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('startTemp')}: <span className="font-bold text-amber-600">{formatTemp(startTemp, tempUnit)}</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {START_TEMP_OPTIONS.map((option) => (
            <button
              key={option.nameKey}
              onClick={() => onStartTempChange(option.temp)}
              className={`p-2 rounded-lg border-2 transition-all ${
                startTemp === option.temp
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <div className="text-xl mb-1">{option.icon}</div>
              <div className="text-xs font-medium">{t(option.nameKey)}</div>
              <div className="text-xs text-gray-500">{formatTemp(option.temp, tempUnit)}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
