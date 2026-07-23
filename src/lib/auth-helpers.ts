/**
 * ponytail: Supabase Auth requires email format for login.
 * We allow employees to use a simple username by appending a fake domain.
 * If input already looks like email, use as-is.
 */
const FAKE_DOMAIN = '@nail.local'

export function toAuthEmail(input: string): string {
  if (input.includes('@')) return input
  return input.toLowerCase().trim() + FAKE_DOMAIN
}

export function fromAuthEmail(authEmail: string): string {
  if (authEmail.endsWith(FAKE_DOMAIN)) {
    return authEmail.replace(FAKE_DOMAIN, '')
  }
  return authEmail
}
