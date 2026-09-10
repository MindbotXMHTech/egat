'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Crosshair, Minus, Plus } from 'lucide-react'
import { cx, STATUS_COLOR } from '../lib/utils'

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.4

function latLonToPercent(lat, lon) {
  const x = 3.403 * lon - 0.0882 * lat - 298.21
  const y = -0.110 * lon - 6.327 * lat + 139.59
  return {
    x: Math.min(96, Math.max(4, x)),
    y: Math.min(92, Math.max(6, y)),
  }
}

function clusterAssets(assets, threshold = 0.45) {
  const clusters = []
  for (const a of assets) {
    const hit = clusters.find(c => Math.hypot(c.lat - a.lat, c.lon - a.lon) < threshold)
    if (hit) {
      hit.assets.push(a)
      hit.lat = hit.assets.reduce((s, x) => s + x.lat, 0) / hit.assets.length
      hit.lon = hit.assets.reduce((s, x) => s + x.lon, 0) / hit.assets.length
    } else {
      clusters.push({ lat: a.lat, lon: a.lon, assets: [a] })
    }
  }
  return clusters
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function clampPan(x, y, zoom, w, h) {
  if (zoom <= 1) return { x: 0, y: 0 }
  const maxX = ((zoom - 1) * w) / 2
  const maxY = ((zoom - 1) * h) / 2
  return {
    x: clamp(x, -maxX, maxX),
    y: clamp(y, -maxY, maxY),
  }
}

export default function ThailandAssetMap({
  assets = [],
  selectedSite,
  onSelectSite,
  className,
}) {
  const wrapRef = useRef(null)
  const zoomRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })
  const dragRef = useRef(null)

  const [hover, setHover] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  zoomRef.current = zoom
  panRef.current = pan

  const clusters = useMemo(
    () => clusterAssets(assets, 0.45 / zoom),
    [assets, zoom],
  )

  useEffect(() => {
    setHover(null)
  }, [assets])

  const applyZoom = useCallback((nextZoom, clientX, clientY) => {
    const el = wrapRef.current
    const z = clamp(Number(nextZoom) || MIN_ZOOM, MIN_ZOOM, MAX_ZOOM)
    const curZ = zoomRef.current
    const curPan = panRef.current
    if (!el) {
      setZoom(z)
      setPan(z <= 1 ? { x: 0, y: 0 } : curPan)
      return
    }
    const rect = el.getBoundingClientRect()
    const cx = clientX != null ? clientX - rect.left : rect.width / 2
    const cy = clientY != null ? clientY - rect.top : rect.height / 2
    const ox = rect.width / 2
    const oy = rect.height / 2
    const mapX = (cx - ox - curPan.x) / curZ
    const mapY = (cy - oy - curPan.y) / curZ
    setZoom(z)
    setPan(clampPan(
      cx - ox - mapX * z,
      cy - oy - mapY * z,
      z,
      rect.width,
      rect.height,
    ))
  }, [])

  const zoomIn = useCallback(() => applyZoom(zoomRef.current + ZOOM_STEP), [applyZoom])
  const zoomOut = useCallback(() => applyZoom(zoomRef.current - ZOOM_STEP), [applyZoom])
  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return undefined
    function onWheel(e) {
      e.preventDefault()
      const factor = e.deltaY > 0 ? 1 / 1.12 : 1.12
      applyZoom(zoomRef.current * factor, e.clientX, e.clientY)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [applyZoom])

  function onPointerDown(e) {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY, pan: panRef.current, moved: false }
    setDragging(true)
  }

  function onPointerMove(e) {
    const drag = dragRef.current
    if (!drag) return
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    if (Math.hypot(dx, dy) > 3) drag.moved = true
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPan(clampPan(
      drag.pan.x + dx,
      drag.pan.y + dy,
      zoomRef.current,
      rect.width,
      rect.height,
    ))
  }

  function endDrag(e) {
    if (dragRef.current) dragRef.current = { ...dragRef.current, ending: true }
    setDragging(false)
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
    window.setTimeout(() => { dragRef.current = null }, 0)
  }

  function onDoubleClick(e) {
    applyZoom(zoomRef.current + ZOOM_STEP, e.clientX, e.clientY)
  }

  const canZoomIn = zoom < MAX_ZOOM - 0.01
  const canZoomOut = zoom > MIN_ZOOM + 0.01
  const canReset = zoom > 1.01 || Math.abs(pan.x) > 0.5 || Math.abs(pan.y) > 0.5

  return (
    <div
      ref={wrapRef}
      className={cx('relative w-full max-w-[947px] mx-auto mb-5 rounded-lg overflow-hidden select-none', className)}
      style={{ aspectRatio: '947 / 510' }}
    >
      <div
        className="absolute inset-0 z-[1] touch-none"
        style={{ cursor: dragging ? 'grabbing' : zoom > 1 ? 'grab' : 'zoom-in' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={onDoubleClick}
      >
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <img
            src="/maps/thailand-satellite.jpg"
            alt="แผนที่สินทรัพย์ประเทศไทย"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          {clusters.map((c, i) => {
            const { x, y } = latLonToPercent(c.lat, c.lon)
            const sites = [...new Set(c.assets.map(a => a.site))]
            const active = selectedSite && sites.includes(selectedSite)
            const count = c.assets.length
            return (
              <button
                key={`${c.lat}-${c.lon}-${i}`}
                type="button"
                className="absolute z-[2]"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  zIndex: active ? 4 : 2,
                  transform: `translate(-50%, -100%) scale(${1 / zoom})`,
                  transformOrigin: 'center bottom',
                }}
                onPointerDown={e => e.stopPropagation()}
                onMouseEnter={() => setHover(c)}
                onMouseLeave={() => setHover(null)}
                onClick={e => {
                  e.stopPropagation()
                  onSelectSite?.(sites[0])
                }}
                title={sites.join(', ')}
              >
                <div className={`relative size-[24px] overflow-visible ${active ? 'scale-125' : ''}`}>
                  <img src="/icons/location-pin.svg" alt="" className="w-full h-full pointer-events-none" />
                  {count > 1 && (
                    <span className="absolute -top-0.5 -right-1 min-w-[11px] h-[11px] px-0.5 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-[10px] font-bold text-black leading-none">{count}</span>
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {hover && (
        <div className="absolute left-3 bottom-3 z-10 bg-white/95 border border-egat-border rounded-xl shadow-card-md px-3 py-2 text-xs max-w-[260px] pointer-events-none">
          <div className="font-semibold text-egat-navy mb-1">
            {[...new Set(hover.assets.map(a => a.site))].join(' · ')}
          </div>
          <div className="text-egat-text-muted mb-1.5">
            {hover.assets.length} อุปกรณ์ · {hover.assets[0].region}
          </div>
          <div className="space-y-0.5 max-h-28 overflow-y-auto">
            {hover.assets.map(a => (
              <div key={a.id} className="flex items-center justify-between gap-2">
                <span className="font-medium text-egat-text">{a.id}</span>
                <span className="font-bold" style={{ color: STATUS_COLOR[a.status]?.hex }}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {assets.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 pointer-events-none">
          <div className="bg-white rounded-xl px-4 py-2 text-sm text-egat-text-sub shadow-card-md">
            ไม่พบสถานที่ตามเงื่อนไขที่ค้นหา
          </div>
        </div>
      )}

      <div className="absolute right-3 top-3 z-10 bg-white/90 rounded-lg px-2.5 py-1.5 text-[10px] text-egat-text-sub pointer-events-none">
        {assets.length} อุปกรณ์บนแผนที่ · {zoom.toFixed(1)}x
      </div>

      <div className="absolute right-2.5 bottom-3 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={resetView}
          disabled={!canReset}
          title="รีเซ็ตมุมมอง"
          className="size-10 bg-white rounded shadow-[0_1px_4px_rgba(0,0,0,0.3)] flex items-center justify-center text-[#666] hover:bg-gray-50 disabled:opacity-40"
        >
          <Crosshair size={18} />
        </button>
        <div className="overflow-hidden rounded shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
          <button
            type="button"
            onClick={zoomIn}
            disabled={!canZoomIn}
            title="ขยาย"
            className="size-10 bg-white flex items-center justify-center text-[#666] hover:bg-gray-50 disabled:opacity-40 border-b border-black/10"
          >
            <Plus size={18} />
          </button>
          <button
            type="button"
            onClick={zoomOut}
            disabled={!canZoomOut}
            title="ย่อ"
            className="size-10 bg-white flex items-center justify-center text-[#666] hover:bg-gray-50 disabled:opacity-40"
          >
            <Minus size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
