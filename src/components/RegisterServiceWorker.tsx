'use client'

import { useEffect } from 'react'

export function RegisterServiceWorker() {
  useEffect(() => {
    const isProd = process.env.NODE_ENV === 'production'
    const isSWSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator

    if (isProd && isSWSupported) {
      // Asegúrate de registrar lo antes posible
      navigator.serviceWorker
        .register('/sw.js')
        .then(reg => {
          console.log('✅ SW registrado:', reg)

          // Asegurar control inmediato
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' })
          }

          if (reg.installing) {
            reg.installing.addEventListener('statechange', e => {
              if (reg.installing?.state === 'installed') {
                console.log('🔁 Nuevo SW instalado')
              }
            })
          }
        })
        .catch(err => {
          console.error('❌ Error al registrar SW:', err)
        })
    }
  }, [])

  return null
}
