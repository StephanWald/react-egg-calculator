import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { useTranslation } from '../useTranslation';

/**
 * ConfigDialog - Settings dialog modal component
 *
 * @param {boolean} visible - Whether dialog is shown
 * @param {function} onClose - Close callback (backdrop click + X button)
 * @param {string} tempUnit - Current temperature unit value
 * @param {function} onTempUnitChange - Temperature unit toggle callback
 * @param {string} volumeUnit - Current volume unit value
 * @param {function} onVolumeUnitChange - Volume unit toggle callback
 * @param {string} weightUnit - Current weight unit value
 * @param {function} onWeightUnitChange - Weight unit toggle callback
 * @param {string} pressureUnit - Current pressure unit value
 * @param {function} onPressureUnitChange - Pressure unit toggle callback
 * @param {array} languages - Available languages array from useTranslation
 * @param {string} currentLanguage - Current language code (lang)
 * @param {function} onLanguageChange - Language change callback (setLanguage)
 */
export const ConfigDialog = ({
  visible,
  onClose,
  tempUnit,
  onTempUnitChange,
  volumeUnit,
  onVolumeUnitChange,
  weightUnit,
  onWeightUnitChange,
  pressureUnit,
  onPressureUnitChange,
  languages,
  currentLanguage,
  onLanguageChange,
}) => {
  const { t } = useTranslation();

  const swipeHandlers = useSwipeable({
    onSwipedDown: (eventData) => {
      if (eventData.velocity > 0.5) onClose();
    },
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  });

  React.useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      {/* Dialog - Bottom drawer on mobile, centered modal on desktop */}
      <div
        {...swipeHandlers}
        className="fixed z-50 bg-white shadow-2xl inset-x-0 bottom-0 rounded-t-2xl max-h-[90vh] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:w-80 sm:max-w-[90vw] sm:max-h-none"
      >
        {/* Swipe handle - mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto max-h-[calc(90vh-3rem)] sm:max-h-none p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">⚙️ {t('configDialogTitle')}</h2>
            <button
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
            >
              ✕
            </button>
          </div>

          {/* Temperature Unit */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('configTempUnit')}</label>
            <button
              onClick={() => onTempUnitChange(tempUnit === 'C' ? 'F' : 'C')}
              className="w-full px-3 py-2 min-h-[44px] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <span className={tempUnit === 'C' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>°C</span>
              <span className="text-gray-300 mx-2">|</span>
              <span className={tempUnit === 'F' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>°F</span>
            </button>
          </div>

          {/* Volume Unit */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('configVolumeUnit')}</label>
            <button
              onClick={() => onVolumeUnitChange(volumeUnit === 'L' ? 'oz' : 'L')}
              className="w-full px-3 py-2 min-h-[44px] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <span className={volumeUnit === 'L' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>L</span>
              <span className="text-gray-300 mx-2">|</span>
              <span className={volumeUnit === 'oz' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>oz</span>
            </button>
          </div>

          {/* Weight Unit */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('configWeightUnit')}</label>
            <button
              onClick={() => onWeightUnitChange(weightUnit === 'g' ? 'oz' : 'g')}
              className="w-full px-3 py-2 min-h-[44px] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <span className={weightUnit === 'g' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>g</span>
              <span className="text-gray-300 mx-2">|</span>
              <span className={weightUnit === 'oz' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>oz</span>
            </button>
          </div>

          {/* Pressure Unit */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('configPressureUnit')}</label>
            <button
              onClick={() => onPressureUnitChange(pressureUnit === 'hPa' ? 'inHg' : 'hPa')}
              className="w-full px-3 py-2 min-h-[44px] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <span className={pressureUnit === 'hPa' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>hPa</span>
              <span className="text-gray-300 mx-2">|</span>
              <span className={pressureUnit === 'inHg' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>inHg</span>
            </button>
          </div>

          {/* Language */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('configLanguage')}</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => onLanguageChange(language.code)}
                  className={`p-2 min-h-[44px] rounded-lg border-2 transition-all text-sm flex flex-col items-center justify-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                    currentLanguage === language.code
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <span className="text-base leading-none">{language.flag}</span>
                  <span className="text-xs leading-tight">{language.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
