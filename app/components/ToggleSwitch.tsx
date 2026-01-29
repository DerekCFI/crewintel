'use client'

interface ToggleSwitchProps {
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
  yesLabel?: string
  noLabel?: string
}

export default function ToggleSwitch({
  label,
  value,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No'
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(value === true ? null : true)}
          className={`min-h-[44px] min-w-[56px] px-4 rounded-lg font-medium transition-colors ${
            value === true
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {yesLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(value === false ? null : false)}
          className={`min-h-[44px] min-w-[56px] px-4 rounded-lg font-medium transition-colors ${
            value === false
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {noLabel}
        </button>
      </div>
    </div>
  )
}
