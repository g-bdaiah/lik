import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'x-application-name': 'gaza-aid-system'
        }
      }
    })
  : null;

export const checkConnection = async (): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('organizations').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

export const getProjectInfo = async () => {
  if (!supabase) {
    return {
      connected: false,
      url: 'غير متصل',
      hasData: false,
      error: 'معلومات الاتصال غير متوفرة'
    };
  }

  try {
    const { data, error } = await supabase.from('organizations').select('count').limit(1);

    if (error) {
      return {
        connected: false,
        url: supabaseUrl || 'غير معروف',
        hasData: false,
        error: error.message
      };
    }

    return {
      connected: true,
      url: supabaseUrl || 'متصل',
      hasData: true,
      error: null
    };
  } catch (error) {
    return {
      connected: false,
      url: supabaseUrl || 'غير معروف',
      hasData: false,
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    };
  }
};

export default supabase;