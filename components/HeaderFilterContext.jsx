'use client'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  createEmptyHeaderFilters,
  headerToTableFilters,
  toggleSelectedDate,
} from '../lib/headerFilters'

const HeaderFilterContext = createContext(null)

export function HeaderFilterProvider({ children }) {
  const [state, setState] = useState(createEmptyHeaderFilters)

  const patch = useCallback((partial) => {
    setState(s => ({ ...s, ...partial }))
  }, [])

  const toggleDate = useCallback((iso) => {
    setState(s => ({ ...s, dates: toggleSelectedDate(s.dates, iso) }))
  }, [])

  const setLocation = useCallback((location) => {
    setState(s => ({ ...s, location: location || '' }))
  }, [])

  const resetHeader = useCallback(() => {
    setState(createEmptyHeaderFilters())
  }, [])

  const value = useMemo(() => ({
    ...state,
    tableFilters: headerToTableFilters(state),
    patch,
    toggleDate,
    setLocation,
    resetHeader,
  }), [state, patch, toggleDate, setLocation, resetHeader])

  return (
    <HeaderFilterContext.Provider value={value}>
      {children}
    </HeaderFilterContext.Provider>
  )
}

export function useHeaderFilters() {
  const ctx = useContext(HeaderFilterContext)
  if (!ctx) {
    const empty = createEmptyHeaderFilters()
    return {
      ...empty,
      tableFilters: headerToTableFilters(empty),
      patch() {},
      toggleDate() {},
      setLocation() {},
      resetHeader() {},
    }
  }
  return ctx
}
