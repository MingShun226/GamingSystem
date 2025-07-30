// Test Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mogacmcsxoqxnxftjquf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ2FjbWNzeG9xeG54ZnRqcXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDk4MDQsImV4cCI6MjA2OTM4NTgwNH0.MzvlA8lsfO6FRLWMclw_J1OnV_ZmgCEyhgTnigSktsE'

const supabase = createClient(supabaseUrl, supabaseKey)

// Test basic connection
async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test 1: Check if we can connect
    const { data, error } = await supabase.from('wager_wave_users').select('count').limit(1)
    
    if (error) {
      console.error('Connection test failed:', error)
      return false
    }
    
    console.log('✅ Connection successful')
    return true
    
  } catch (err) {
    console.error('❌ Connection failed:', err)
    return false
  }
}

// Test function call
async function testFunction() {
  try {
    console.log('Testing register_wager_user function...')
    
    const { data, error } = await supabase.rpc('register_wager_user', {
      username_input: 'test_user_' + Date.now(),
      phone_input: '1234567890'
    })
    
    if (error) {
      console.error('Function test failed:', error)
      return false
    }
    
    console.log('✅ Function test successful:', data)
    return true
    
  } catch (err) {
    console.error('❌ Function test failed:', err)
    return false
  }
}

// Run tests
async function runTests() {
  console.log('=== Supabase Tests ===')
  
  const connectionOk = await testConnection()
  if (!connectionOk) {
    console.log('❌ Cannot proceed - connection failed')
    return
  }
  
  const functionOk = await testFunction()
  if (!functionOk) {
    console.log('❌ Function test failed - you need to create the database functions')
  }
}

runTests()