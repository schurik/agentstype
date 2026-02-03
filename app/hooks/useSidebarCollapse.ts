'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'sidebar-collapsed'

export function useSidebarCollapse() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  // Read from localStorage after mount (hydration-safe)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setIsCollapsed(stored === 'true')
    }
    setHasMounted(true)
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed))
    }
  }, [isCollapsed, hasMounted])

  const toggle = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  return { isCollapsed, setIsCollapsed, toggle, hasMounted }
}
