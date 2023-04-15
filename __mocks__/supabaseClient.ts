import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://supabase.mock';
const supabaseAnonKey = 'mock-key';

const mockedSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
const mockedServiceSupabase = async ()=> createClient<Database>(supabaseUrl, supabaseAnonKey);

export const supabase = mockedSupabase;
export const getServiceSupabase = mockedServiceSupabase;
