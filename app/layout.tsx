import type { Metadata } from 'next'
import { ThemedApp } from './themed-app'
import './globals.css'

export const metadata: Metadata = {
  title: 'Twilio Phone Number Assistant',
  description: 'Find the perfect Twilio phone number for your use case',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemedApp>
          {children}
        </ThemedApp>
      </body>
    </html>
  )
}
