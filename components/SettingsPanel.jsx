import { useTranslation } from '../useTranslation';
import { STOVE_TYPES, POT_MATERIALS } from '../constants';
import { formatTemp } from '../formatters';

/**
 * SettingsPanel - Household settings configuration panel
 *
 * Displays stove type selection, power adjustment, pot material/weight,
 * water/ambient temperature controls, and reset functionality.
 *
 * @param {Object} props
 * @param {string} props.stoveType - Current stove type ID
 * @param {number} props.stovePower - Current stove power in watts
 * @param {number} props.stoveEfficiency - Current stove efficiency (0-1)
 * @param {string} props.potMaterial - Current pot material ID
 * @param {number} props.potWeight - Current pot weight in kg
 * @param {number} props.waterStartTemp - Water start temperature in Celsius
 * @param {number} props.ambientTemp - Ambient temperature in Celsius
 * @param {string} props.tempUnit - Temperature display unit ('C' or 'F')
 * @param {Function} props.onStoveTypeChange - Callback with stove type ID
 * @param {Function} props.onStovePowerChange - Callback with power number
 * @param {Function} props.onPotMaterialChange - Callback with material ID
 * @param {Function} props.onPotWeightChange - Callback with weight number
 * @param {Function} props.onWaterStartTempChange - Callback with temp number
 * @param {Function} props.onAmbientTempChange - Callback with temp number
 * @param {Function} props.onResetToDefaults - Reset handler (called after confirm)
 */
export function SettingsPanel({
  stoveType,
  stovePower,
  stoveEfficiency,
  potMaterial,
  potWeight,
  waterStartTemp,
  ambientTemp,
  tempUnit,
  onStoveTypeChange,
  onStovePowerChange,
  onPotMaterialChange,
  onPotWeightChange,
  onWaterStartTempChange,
  onAmbientTempChange,
  onResetToDefaults,
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">⚙️ {t('settingsTitle')}</h2>
      <p className="text-sm text-gray-500 mb-4">{t('settingsHint')}</p>

      {/* Stove Type */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('stoveType')}</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {STOVE_TYPES.map((stove) => (
            <button
              key={stove.id}
              onClick={() => onStoveTypeChange(stove.id)}
              className={`p-3 min-h-[44px] rounded-lg border-2 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                stoveType === stove.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <div className="text-xl">{stove.icon}</div>
              <div className="text-xs font-medium">{t(stove.nameKey)}</div>
              <div className="text-xs text-gray-500">{Math.round(stove.efficiency * 100)}%</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stove Power */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('stovePower')}: <span className="font-bold text-amber-600">{stovePower} W</span>
        </label>
        <input
          type="range"
          min="500"
          max="3500"
          step="100"
          value={stovePower}
          onChange={(e) => onStovePowerChange(Number(e.target.value))}
          className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>500W ({t('stovePowerWeak')})</span>
          <span>3500W ({t('stovePowerStrong')})</span>
        </div>
      </div>

      {/* Pot Material & Weight */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('potMaterial')}</label>
          <select
            value={potMaterial}
            onChange={(e) => onPotMaterialChange(e.target.value)}
            className="w-full p-2 text-base min-h-[44px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {POT_MATERIALS.map((mat) => (
              <option key={mat.id} value={mat.id}>{t(mat.nameKey)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('potWeight')}: <span className="font-bold text-amber-600">{potWeight} kg</span>
          </label>
          <input
            type="range"
            min="0.3"
            max="3.0"
            step="0.1"
            value={potWeight}
            onChange={(e) => onPotWeightChange(Number(e.target.value))}
            className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
          />
        </div>
      </div>

      {/* Water Start Temperature & Ambient Temperature */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('temperatures')}</label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Water Start Temp */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span>🚰</span>
              <span className="text-sm font-medium text-blue-800">{t('waterTemp')}</span>
            </div>
            <div className="text-xs text-blue-600 mb-2">{t('waterTempHint')}</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="2"
                max="40"
                value={waterStartTemp}
                onChange={(e) => onWaterStartTempChange(Number(e.target.value))}
                className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-sm font-bold text-blue-700 w-14 text-right">{formatTemp(waterStartTemp, tempUnit)}</span>
            </div>
            <div className="flex justify-between text-xs text-blue-500 mt-1">
              <span>{t('waterTempCold')} {formatTemp(2, tempUnit)}</span>
              <span>{t('waterTempWarm')} {formatTemp(40, tempUnit)}</span>
            </div>
          </div>

          {/* Ambient Temp */}
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span>🌡️</span>
              <span className="text-sm font-medium text-orange-800">{t('ambientTemp')}</span>
            </div>
            <div className="text-xs text-orange-600 mb-2">{t('ambientTempHint')}</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="-10"
                max="35"
                value={ambientTemp}
                onChange={(e) => onAmbientTempChange(Number(e.target.value))}
                className="flex-1 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="text-sm font-bold text-orange-700 w-14 text-right">{formatTemp(ambientTemp, tempUnit)}</span>
            </div>
            <div className="flex justify-between text-xs text-orange-500 mt-1">
              <span>{t('ambientWinter')} {formatTemp(-10, tempUnit)}</span>
              <span>{t('ambientSummer')} {formatTemp(35, tempUnit)}</span>
            </div>
          </div>
        </div>

        {ambientTemp < 10 && stoveEfficiency < 0.6 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
            ⚠️ {t('coldWeatherWarning')}
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            const message = `${t('resetConfirm')}\n\n${t('resetWarning')}`;
            if (window.confirm(message)) {
              onResetToDefaults();
            }
          }}
          className="w-full py-3 min-h-[44px] px-4 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
        >
          🔄 {t('resetToDefaults')}
        </button>
      </div>
    </div>
  );
}
