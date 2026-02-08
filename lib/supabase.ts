
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase configuration.
 * Using the project credentials directly to ensure connection in the browser environment.
 */
const supabaseUrl = 'https://wsygyekughkjtxrmcwzq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzeWd5ZWt1Z2hranR4cm1jd3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDgzMjIsImV4cCI6MjA4NjA4NDMyMn0.t3ir9Hktu_Q26haR2kGcCAQmgWVeYxGiB0DXXl7ba9Q';

export const isConfigured = true;

// Initialize the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
