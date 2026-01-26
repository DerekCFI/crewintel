import { auth, currentUser } from '@clerk/nextjs/server'

const ADMIN_EMAIL = 'derek@crewintel.org'

export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth()
  if (!userId) return false

  const user = await currentUser()
  if (!user) return false

  const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
  return email === ADMIN_EMAIL
}

export async function requireAdmin(): Promise<{ authorized: true } | { authorized: false; error: string }> {
  const { userId } = await auth()

  if (!userId) {
    return { authorized: false, error: 'Not authenticated' }
  }

  const user = await currentUser()
  if (!user) {
    return { authorized: false, error: 'User not found' }
  }

  const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress

  if (email !== ADMIN_EMAIL) {
    return { authorized: false, error: 'Not authorized' }
  }

  return { authorized: true }
}
