import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});

// 데이터베이스 연결 테스트 함수
export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('agents').select('count').limit(1);
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
};

// Database types
export type Database = {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          name: string;
          description: string;
          capabilities: string[];
          status: 'idle' | 'busy' | 'error';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['agents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['agents']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: 'pending' | 'in_progress' | 'completed' | 'failed';
          assigned_to: string | null;
          created_by: string;
          priority: 'low' | 'medium' | 'high';
          deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
    };
  };
}; 