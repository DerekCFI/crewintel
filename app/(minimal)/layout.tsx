export const metadata = {
  title: 'Quick Log - CrewIntel',
  description: 'Quickly log your crew experience',
}

export default function MinimalLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
