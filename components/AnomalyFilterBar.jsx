'use client'
import DateTimeRangeField from './DateTimeRangeField'
import SearchSuggestInput from './SearchSuggestInput'

export default function AnomalyFilterBar({
  filters,
  locations = [],
  onChange,
  onSearch,
  onReset,
  showLocation = true,
  showDate = true,
  suggestions = [],
}) {
  const suggestItems = suggestions.length
    ? suggestions
    : locations.map(loc => ({ value: loc, label: loc, group: 'สถานี' }))

  return (
    <div className="relative z-20 flex flex-wrap items-end gap-3 mb-4">
      {showDate && (
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-egat-text-muted mb-1">
          Date &amp; time
        </label>
        <DateTimeRangeField filters={filters} onChange={onChange} />
      </div>
      )}

      {showLocation && (
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-egat-text-muted mb-1">
          Location
        </label>
        <select
          value={filters.location}
          onChange={e => onChange({ location: e.target.value })}
          className="text-xs border border-egat-border rounded-lg pl-[17px] pr-7 py-[7px] bg-egat-surface text-egat-text min-w-[268px] focus:outline-none focus:border-egat-navy"
        >
          <option value="">ทั้งหมด</option>
          {locations.map(site => (
            <option key={site} value={site}>{site}</option>
          ))}
        </select>
      </div>
      )}

      <div className="flex flex-col">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-transparent mb-1 select-none">Search</span>
        <div className="flex items-center gap-2.5">
          <SearchSuggestInput
            value={filters.query ?? ''}
            onChange={next => onChange({ query: next })}
            onSearch={onSearch}
            suggestions={suggestItems}
            placeholder="ค้นหา..."
          />
          <button type="button"
            onClick={() => {
              onChange({
                dateFrom: '',
                dateTo: '',
                timeFrom: '08:00',
                timeTo: '12:00',
                location: '',
                query: '',
              })
              onReset?.()
            }}
            className="text-sm px-4 py-2 rounded-lg border border-solid whitespace-nowrap"
            style={{ borderColor:'#FFCB05', color:'#4E4E4E', background:'#fff' }}>
            Reset
          </button>
          <button type="button" onClick={onSearch}
            className="text-sm px-4 py-2 rounded-lg whitespace-nowrap"
            style={{ background:'#FFCB05', color:'#034EA2' }}>
            Search
          </button>
        </div>
      </div>
    </div>
  )
}
