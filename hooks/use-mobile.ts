import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Starts `undefined` on both server and the client's first render (before
  // hydration) so the two always match — reading `window.innerWidth` here
  // would give the server `false` (no window) but the client the real
  // viewport width, mismatching whenever that's under the breakpoint.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    onChange() // sync the real value once mounted — the effect above only
    // covers *later* resize events, not the initial viewport
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
