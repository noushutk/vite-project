// Placeholder for supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlgmluasoegyghntvotn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsZ21sdWFzb2VneWdobnR2b3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTc4MDgsImV4cCI6MjA2MzM5MzgwOH0.Wa_IqbdiCOyRHRKTQ5rFpCAvNmkd4GEE3ESGoFHz1Ek';
export const supabase = createClient(supabaseUrl, supabaseKey);