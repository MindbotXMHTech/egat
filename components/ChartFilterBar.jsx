'use client'
import DateTimeRangeField from './DateTimeRangeField'
import DeviceTypeSelect from './DeviceTypeSelect'
import ExportMenu from './ExportMenu'

const RESET_YELLOW = { borderColor: '#FFCB05', color: '#4E4E4E', background: '#fff' }
const RESET_MUTED = { borderColor: '#DDE3ED', color: '#1A202C', background: '#fff' }

export default function ChartFilterBar({
  query,
  onQueryChange,
  onSearch,
  onReset,
  showSearchButton = false,
  resetVariant = 'yellow',
  sortLabel,
  onSort,
  onExport,
  countLabel,
  dateFilters,
  onDateChange,
  typeValue,
  onTypeChange,
  thresholdValue,
  onThresholdChange,
}) {
  function handleKey(e) {
    if (e.key === 'Enter') onSearch?.()
  }

  return (
    <div className="relative z-20 flex flex-wrap items-center gap-2.5 mb-3">
      <input
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="🔍 ค้นหา..."
        className="text-xs border border-egat-border rounded-lg px-[13px] py-[8px] bg-white text-egat-text placeholder:text-[#9CA3AF] w-44 focus:outline-none focus:border-egat-navy"
      />
      {onTypeChange && (
        <DeviceTypeSelect value={typeValue || ''} onChange={onTypeChange} />
      )}
      {onThresholdChange && (
        <label className="flex items-center gap-1.5 text-xs text-egat-text-sub whitespace-nowrap">
          Threshold
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={thresholdValue}
            onChange={e => onThresholdChange(Number(e.target.value))}
            className="w-[72px] text-xs border border-egat-border rounded-lg px-2 py-[7px] bg-white text-egat-text focus:outline-none focus:border-egat-navy"
          />
        </label>
      )}
      {dateFilters && onDateChange && (
        <DateTimeRangeField filters={dateFilters} onChange={onDateChange} />
      )}
      {sortLabel && (
        <button
          type="button"
          onClick={onSort}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-solid text-sm whitespace-nowrap"
          style={{ borderColor: '#DDE3ED', color: '#4E4E4E', background: '#fff' }}
        >
          <span className="size-4 overflow-hidden shrink-0 inline-flex">
            <img src="/icons/bx-sort.svg" alt="" className="w-full h-full" />
          </span>
          {sortLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onReset}
        className="text-sm px-4 py-2 rounded-lg border border-solid whitespace-nowrap"
        style={resetVariant === 'muted' ? RESET_MUTED : RESET_YELLOW}
      >
        Reset
      </button>
      {showSearchButton && (
        <button
          type="button"
          onClick={onSearch}
          className="text-sm px-4 py-2 rounded-lg whitespace-nowrap"
          style={{ background: '#FFCB05', color: '#034EA2' }}
        >
          Search
        </button>
      )}
      {onExport && (
        <div className="flex items-center gap-2 ml-auto">
          <ExportMenu onSelect={onExport} />
          {countLabel ? (
            <span className="text-[10px] text-egat-text-muted whitespace-nowrap">{countLabel}</span>
          ) : null}
        </div>
      )}
    </div>
  )
}
