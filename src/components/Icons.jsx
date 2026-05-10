const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' }

export function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="3"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  )
}

export function IconHome(props) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )
}

export function IconList(props) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
  )
}

export function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="2.5" {...base} {...props}>
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  )
}

export function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="2" {...base} {...props}>
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  )
}

export function IconChevronLeft(props) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="2" {...base} {...props}>
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  )
}

export function IconChevronRight(props) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="2" {...base} {...props}>
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}

export function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="2" {...base} {...props}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}

export function IconLogout(props) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

export function IconInbox(props) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  )
}

export function IconLogo(props) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  )
}

export function IconCheckCircle(props) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="2" {...base} {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}
