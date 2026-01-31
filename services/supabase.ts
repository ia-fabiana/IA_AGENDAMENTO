
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

type ErrorResult = { data: null; error: Error };

const createErrorResult = (message: string): ErrorResult => ({ data: null, error: new Error(message) });

type MockBuilder = {
  eq: () => MockBuilder;
  limit: () => MockBuilder;
  order: () => MockBuilder;
  single: () => Promise<ErrorResult>;
  then: (resolve: (value: ErrorResult) => any, reject?: (reason?: any) => any) => Promise<ErrorResult>;
  catch: (reject: (reason?: any) => any) => Promise<ErrorResult>;
};

const getConfigErrorMessage = () => {
  if (!supabaseUrl && !supabaseAnonKey) return 'Supabase URL and anon key missing';
  if (!supabaseUrl) return 'Supabase URL missing';
  if (!supabaseAnonKey) return 'Supabase anon key missing';
  return 'Supabase not configured';
};

const createMockBuilder = (): MockBuilder => ({
  eq: () => createMockBuilder(),
  limit: () => createMockBuilder(),
  order: () => createMockBuilder(),
  single: () => Promise.resolve(createErrorResult(getConfigErrorMessage())),
  then: (resolve: (value: ErrorResult) => any, reject?: (reason?: any) => any) =>
    Promise.resolve(createErrorResult(getConfigErrorMessage())).then(resolve, reject),
  catch: (reject: (reason?: any) => any) => Promise.resolve(createErrorResult(getConfigErrorMessage())).catch(reject)
});

const createMockClient = () => ({
  from: () => ({
    select: () => createMockBuilder(),
    update: () => createMockBuilder(),
    upsert: () => Promise.resolve(createErrorResult(getConfigErrorMessage())),
    insert: () => Promise.resolve(createErrorResult(getConfigErrorMessage()))
  })
});

export const supabase = !supabaseUrl || !supabaseAnonKey
  ? createMockClient()
  : createClient(supabaseUrl, supabaseAnonKey);
