import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'CrewBase',
  description: 'Your crew\'s guide to the best travel services',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-blue-600 text-white p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              CrewBase
            </Link>
            <div className="flex gap-6">
              <Link href="/hotels" className="hover:underline">
                Hotels
              </Link>
              <Link href="/hotels/add" className="hover:underline">
                Add Hotel
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
