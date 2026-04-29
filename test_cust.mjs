import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCols() {
  const { data } = await supabase.from('customers').select('*').limit(1);
  console.log('customers schema:', data ? Object.keys(data[0] || {}) : 'none');
}

checkCols();
