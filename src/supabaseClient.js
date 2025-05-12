import { createClient } from '@supabase/supabase-js';

// Supabase URL and anon key
const supabaseUrl = 'https://lfoyrprbytlsligewzns.supabase.co';  // Your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3lycHJieXRsc2xpZ2V3em5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNTUxMTEsImV4cCI6MjA1ODczMTExMX0.zCo9ZajA5-R0ROkIU_u0IV_5sg-mR1mdbPsdaeAWSkc';  // Your anon key

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
