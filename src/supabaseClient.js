import { createClient } from '@supabase/supabase-js';

// Read from .env file (React uses REACT_APP_ variables)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
