import './globals.css'
import Link from 'next/link'
import HeaderSearch from './components/HeaderSearch'

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
              <Link href="/fbos" className="hover:underline">
                FBOs
              </Link>
              <Link href="/restaurants" className="hover:underline">
                Restaurants
              </Link>
              <Link href="/rentals" className="hover:underline">
                Car Rentals
              </Link>

              <Link href="/add" className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-gray-100">
                + Add Location
              </Link>
              <div className="flex items-center gap-6">
  <Link href="/hotels" className="hover:underline">
    Hotels
  </Link>
  <Link href="/fbos" className="hover:underline">
    FBOs
  </Link>
  <Link href="/restaurants" className="hover:underline">
    Restaurants
  </Link>
  <Link href="/rentals" className="hover:underline">
    Car Rentals
  </Link>

  <Link href="/add" className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-gray-100">
    + Add Location
  </Link>

  <HeaderSearch />
</div>

            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}