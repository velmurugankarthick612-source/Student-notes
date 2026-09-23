const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(supabaseUrl && (supabaseServiceKey || supabaseAnonKey));

if (!isConfigured) {
  console.warn(
    '\x1b[33m%s\x1b[0m',
    '⚠️ [StudyHub Warning]: Supabase credentials not found in environment variables. Running in diagnostic mode. Please update backend/.env with your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
  );
}

// Client with Service Role Key for backend administration & storage
const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

module.exports = {
  supabase,
  isConfigured,
  supabaseUrl,
};
