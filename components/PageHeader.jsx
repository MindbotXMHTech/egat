'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import NotificationPanel from './NotificationPanel'
import HeaderDateTimePicker from './HeaderDateTimePicker'
import HeaderLocationSelect from './HeaderLocationSelect'
import { useHeaderFilters } from './HeaderFilterContext'
import { apiLookbackBounds, headerControlsForPath } from '../lib/headerFilters'
import { useSiteScope } from './useSiteScope'

export default function PageHeader({
  icon,
  title,
  subtitle,
  badge,
  right,
  extraAlerts,
  showLocation,
  showDatePicker,
}) {
  const pathname = usePathname()
  const header = useHeaderFilters()
  const { all, locations } = useSiteScope()
  const controls = headerControlsForPath(pathname)
  const locationOn = showLocation ?? controls.location
  const dateOn = showDatePicker ?? controls.date
  const apiLookback = dateOn && String(pathname || '').startsWith('/dashboard/api-library')
    ? apiLookbackBounds()
    : null

  useEffect(() => {
    if (!header.location) return
    if (!locations.includes(header.location)) header.setLocation('')
  }, [header.location, header.setLocation, locations])

  return (
    <header
      className="sticky top-0 z-30 bg-egat-surface border-b border-egat-border-lt -mx-4 -mt-4 mb-5 sm:-mx-6 sm:-mt-6"
    >
      <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
            style={{ background: '#1B3A6B' }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-sm font-bold leading-tight truncate" style={{ color: '#1B3A6B' }}>{title}</h1>
              {badge && (
                <span
                  className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold tracking-wider uppercase shrink-0"
                  style={{ background: '#1B3A6B', color: '#E8960C' }}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle ? (
              <p className="text-[0.68rem] leading-tight truncate mt-0.5 hidden min-[480px]:block" style={{ color: '#8896A4' }}>{subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {right}
          {locationOn && (
            <HeaderLocationSelect
              location={header.location}
              locations={locations}
              onChange={header.setLocation}
              allLabel={all ? 'ทุก Site / Location' : 'ทุกไซต์ที่ได้รับสิทธิ์'}
            />
          )}
          {dateOn && (
            <HeaderDateTimePicker
              dates={header.dates}
              timeFrom={header.timeFrom}
              timeTo={header.timeTo}
              onToggleDate={header.toggleDate}
              onTimeChange={header.patch}
              onClearDates={() => header.patch({ dates: [] })}
              minDate={apiLookback?.minDate}
              maxDate={apiLookback?.maxDate}
              hint={apiLookback ? 'ย้อนหลังได้สูงสุด 90 วัน' : undefined}
            />
          )}
          <div className="text-right hidden 2xl:block pl-1">
            <div className="text-[0.65rem] font-medium leading-tight" style={{ color: '#8896A4' }}>กฟผ. ฝ่ายระบบสื่อสาร</div>
            <div className="text-[0.6rem] leading-tight" style={{ color: '#8896A4' }}>อรส.</div>
          </div>
          <NotificationPanel extraAlerts={extraAlerts || []} />
        </div>
      </div>
    </header>
  )
}
