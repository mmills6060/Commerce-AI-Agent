import dotenv from 'dotenv'
dotenv.config()

import { supabase } from '../lib/supabase.js'

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...\n')

  // Check environment variables
  console.log('Environment variables:')
  console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Not set')
  console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set')
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Not set')
  console.log()

  try {
    // Test database connection
    console.log('Testing database connection...')
    const { data, error } = await supabase.from('products').select('count').limit(1)

    if (error) {
      console.error('✗ Connection failed:', error.message)
      return false
    }

    console.log('✓ Database connection successful')
    console.log()

    // Check tables
    console.log('Checking tables...')
    const tables = ['products', 'orders', 'chat_sessions']
    
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('count').limit(1)
      
      if (tableError) {
        console.log(`✗ Table '${table}' not found or inaccessible`)
      } else {
        console.log(`✓ Table '${table}' exists`)
      }
    }
    console.log()

    // Check for products
    console.log('Checking for products...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5)

    if (productsError) {
      console.error('✗ Failed to fetch products:', productsError.message)
      return false
    }

    if (!products || products.length === 0) {
      console.log('⚠ No products found in database')
      console.log('  Run "npm run seed" to populate the database')
    } else {
      console.log(`✓ Found ${products.length} products`)
      console.log('  Sample products:')
      products.forEach((p: any, i) => {
        console.log(`  ${i + 1}. ${p.name} - $${p.price}`)
      })
    }
    console.log()

    console.log('✓ All tests passed!')
    return true
  } catch (error) {
    console.error('✗ Unexpected error:', error)
    return false
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSupabaseConnection()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('Test failed:', error)
      process.exit(1)
    })
}

export { testSupabaseConnection }

