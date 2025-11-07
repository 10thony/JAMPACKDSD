import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface SettingsContextType {
  showProjectPackages: boolean
  setShowProjectPackages: (value: boolean) => void
  toggleShowProjectPackages: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const SHOW_PROJECT_PACKAGES_KEY = 'settings-show-project-packages'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showProjectPackages, setShowProjectPackagesState] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true
    }

    const stored = window.localStorage.getItem(SHOW_PROJECT_PACKAGES_KEY)

    if (stored === null) {
      return true
    }

    return stored === 'true'
  })

  useEffect(() => {
    window.localStorage.setItem(SHOW_PROJECT_PACKAGES_KEY, String(showProjectPackages))
  }, [showProjectPackages])

  const setShowProjectPackages = useCallback((value: boolean) => {
    setShowProjectPackagesState(value)
  }, [])

  const toggleShowProjectPackages = useCallback(() => {
    setShowProjectPackagesState((prev) => !prev)
  }, [])

  return (
    <SettingsContext.Provider
      value={{ showProjectPackages, setShowProjectPackages, toggleShowProjectPackages }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)

  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }

  return context
}


