import './globals.css'
import { Work_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Header from './components/Header'
import Footer from './components/Footer'
import FeedbackButton from './components/FeedbackButton'

const workSans = Work_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-work-sans'
})

export const metadata = {
  title: 'CrewIntel',
  description: 'Your crew\'s guide to the best travel services',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`flex flex-col min-h-screen ${workSans.variable}`}>
          <Header />

          <main className="flex-grow">
            {children}
          </main>

          <Footer />
          <FeedbackButton />
        </body>
      </html>
    </ClerkProvider>
  )
}
