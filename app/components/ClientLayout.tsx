'use client'

import { Providers } from '../providers'
import { Toaster } from 'react-hot-toast'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Toaster position="top-right" />
      {children}
    </Providers>
  )
} 