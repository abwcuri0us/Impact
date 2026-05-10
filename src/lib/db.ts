// Legacy Prisma DB - migrated to Supabase
// This module is kept for backward compatibility.
// If you see this warning, update imports to use @/lib/supabase instead.

if (process.env.NODE_ENV !== 'production') {
  console.warn(
    '[db] Legacy Prisma module loaded. This is a no-op stub. ' +
    'Import from @/lib/supabase instead.'
  )
}

export const db = null as unknown as Record<string, unknown>
