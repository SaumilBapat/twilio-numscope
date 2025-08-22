"use client"

import { Theme } from "@twilio-paste/theme"
import { CustomizationProvider } from "@twilio-paste/core/customization"
import { Box, Button } from "@twilio-paste/core"
import { LightModeIcon } from "@twilio-paste/icons/esm/LightModeIcon"
import { DarkModeIcon } from "@twilio-paste/icons/esm/DarkModeIcon"
import { useEffect, useState, createContext, useContext } from "react"

// Create theme context
const ThemeContext = createContext<{
  isDark: boolean
  toggleTheme: () => void
}>({
  isDark: false,
  toggleTheme: () => {}
})

export const useTheme = () => useContext(ThemeContext)

export function ThemedApp({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Detect system preference and load saved preference
  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme-preference")
      if (saved !== null) {
        setIsDark(saved === "dark")
      } else {
        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
        setIsDark(prefersDark)
      }
    }
  }, [])

  // Listen for system theme changes only if no manual preference is set
  useEffect(() => {
    if (typeof window !== "undefined" && mounted) {
      const saved = localStorage.getItem("theme-preference")
      if (saved === null) {
        const mq = window.matchMedia("(prefers-color-scheme: dark)")
        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
        mq.addEventListener?.("change", handler)
        return () => mq.removeEventListener?.("change", handler)
      }
    }
  }, [mounted])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    if (typeof window !== "undefined") {
      localStorage.setItem("theme-preference", newTheme ? "dark" : "light")
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>
  }

  const theme = isDark ? "dark" : "default"

  // Customization overrides for Twilio branding
  const customElements = {}

  // Override brand color to use Twilio red
  const themeOverrides = {
    backgroundColors: {
      colorBackgroundBrand: "#F22F46" // Twilio red
    }
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <Theme.Provider theme={theme}>
        <CustomizationProvider 
          baseTheme={theme} 
          elements={customElements}
          theme={themeOverrides}
        >
          {children}
        </CustomizationProvider>
      </Theme.Provider>
    </ThemeContext.Provider>
  )
}

// Custom Sun Icon Component
function CustomSunIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#1a1a1a" />
      <circle cx="12" cy="12" r="4" fill="#FFD700" />
      <g stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M6.34 17.66l-1.41 1.41" />
        <path d="M19.07 4.93l-1.41 1.41" />
      </g>
    </svg>
  )
}

// Custom Moon Icon Component
function CustomMoonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#000000" />
    </svg>
  )
}

// Theme Toggle Component
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  
  return (
    <Box
      backgroundColor="colorBackgroundBody"
      borderRadius="borderRadiusCircle"
      padding="space20"
      boxShadow="shadowHigh"
    >
      <Button
        variant="secondary_icon"
        size="icon"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? <CustomSunIcon /> : <CustomMoonIcon />}
      </Button>
    </Box>
  )
}