import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mychatapp',
  description: 'Chat kwa Username + NICK AI',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sw">
      <body>{children}</body>
    </html>
  )
}
