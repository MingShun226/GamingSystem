import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mogacmcsxoqxnxftjquf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ2FjbWNzeG9xeG54ZnRqcXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDk4MDQsImV4cCI6MjA2OTM4NTgwNH0.MzvlA8lsfO6FRLWMclw_J1OnV_ZmgCEyhgTnigSktsE'

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface WagerWaveUser {
  id: string
  username: string
  phone: string
  login_count: number
  is_active: boolean
  created_at: string
  last_login?: string
}