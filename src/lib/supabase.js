// Placeholder for supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qnhjgoytmjvlguoewesz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuaGpnb3l0bWp2bGd1b2V3ZXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDYwMjEsImV4cCI6MjA4MDE4MjAyMX0.LZATAwGSfPA7dpv9wuIzt_pKoP7a7eqrtrA7zHzfb4E';
export const supabase = createClient(supabaseUrl, supabaseKey);