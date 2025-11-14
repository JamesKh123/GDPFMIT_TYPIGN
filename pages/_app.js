import '../styles/globals.css'
import { useEffect } from 'react'

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // focus outlines for keyboard users
    const handleFirstTab = (e) => {
      if (e.key === 'Tab') document.documentElement.classList.add('user-is-tabbing')
    }
    window.addEventListener('keydown', handleFirstTab)
    return () => window.removeEventListener('keydown', handleFirstTab)
  }, [])

  return <Component {...pageProps} />
}
