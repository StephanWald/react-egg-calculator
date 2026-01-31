import React from 'react';
import { useTranslation } from '../useTranslation';
import { CONSISTENCY_OPTIONS } from '../constants';
import { formatTemp } from '../formatters';

/**
 * ConsistencyPicker - Egg consistency selection component
 *
 * @param {string} consistency - Current consistency ID
 * @param {string} tempUnit - Temperature unit for display
 * @param {function} onConsistencyChange - Callback receiving the full option object
 */
export const ConsistencyPicker = ({
  consistency,
  tempUnit,
  onConsistencyChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">{t('consistency')}</label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CONSISTENCY_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onConsistencyChange(option)}
            className={`p-3 min-h-[44px] rounded-xl border-2 transition-all ${
              consistency === option.id
                ? 'border-amber-500 bg-amber-50 shadow-md'
                : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: option.color }}></div>
            <div className="font-medium text-gray-900 text-xs">{t(option.nameKey)}</div>
            <div className="text-xs text-gray-500">{formatTemp(option.temp, tempUnit)}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
