import { Suspense } from 'react'
import SearchResults from './SearchResults'

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}
