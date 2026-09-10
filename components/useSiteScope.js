'use client'
import { useMemo } from 'react'
import { useAuth } from './AuthContext'
import { uniqueSites } from '../lib/anomalyFilters'
import { FLEET } from '../lib/data'
import { hasAllSites, sitesForAccount } from '../lib/authAccounts'

export function useSiteScope() {
  const { currentUser } = useAuth()
  const catalog = useMemo(() => uniqueSites(FLEET), [])

  return useMemo(() => {
    const all = hasAllSites(currentUser)
    const allowedSites = all ? null : sitesForAccount(currentUser, catalog)
    const locations = all ? catalog : (allowedSites || [])
    const scopedFleet = all ? FLEET : FLEET.filter(f => locations.includes(f.site))
    const allowedIdSet = new Set(scopedFleet.map(f => f.id))
    return { all, allowedSites, locations, scopedFleet, allowedIdSet, catalog }
  }, [currentUser, catalog])
}
