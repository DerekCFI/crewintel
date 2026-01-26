import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

config({ path: '.env.local' })

const __dirname = dirname(fileURLToPath(import.meta.url))

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL)
  const migrationPath = join(__dirname, '..', 'migrations', 'add_admin_columns.sql')
  const migration = readFileSync(migrationPath, 'utf-8')

  // Split by semicolons and run each statement
  const statements = migration
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const stmt of statements) {
    console.log('Running:', stmt.substring(0, 60) + '...')
    try {
      await sql(stmt)
      console.log('Success!')
    } catch (error) {
      console.log('Error (may be expected if column exists):', error.message)
    }
  }

  console.log('Migration complete!')
}

runMigration()
