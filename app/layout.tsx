import { Inter } from 'next/font/google'
import './globals.css'
import { ClientLayout } from './components/ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Lastik Bende - Online Lastik Satış Mağazası',
  description: 'Türkiye\'nin en büyük online lastik satış mağazası',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={`${inter.className} app-body`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
} 