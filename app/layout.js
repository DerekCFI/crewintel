import './globals.css'
import { Work_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

const workSans = Work_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-work-sans'
})

export const metadata = {
  title: 'CrewIntel',
  description: 'Your crew\'s guide to the best travel services',
  metadataBase: new URL('https://crewintel.net'),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CrewIntel Quick Log',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: 'CrewIntel',
    description: 'Your crew\'s guide to the best travel services',
    url: 'https://crewintel.net',
    siteName: 'CrewIntel',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CrewIntel',
    description: 'Your crew\'s guide to the best travel services',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport = {
  themeColor: '#1E3A8A',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`min-h-screen ${workSans.variable}`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
