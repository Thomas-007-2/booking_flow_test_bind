// Test file to verify Supabase connection
    import { supabase } from './supabaseClient';

    export async function testSupabaseConnection() {
      try {
        // Test a simple query to verify connection
        const { data, error } = await supabase
          .from('merchants')
          .select('id, name')
          .limit(1);

        if (error) {
          console.error('Supabase connection test failed:', error);
          return { success: false, error };
        }

        console.log('Supabase connection test successful:', data);
        return { success: true, data };
      } catch (err) {
        console.error('Supabase connection test error:', err);
        return { success: false, error: err };
      }
    }