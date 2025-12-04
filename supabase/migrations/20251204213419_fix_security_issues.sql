/*
  # Fix Security Issues

  1. Remove Unused Indexes
    - Drop `idx_arbitrage_category` - not being used by queries
    - Drop `idx_arbitrage_created` - not being used by queries
    - Keep `idx_arbitrage_active_profit` as it's the primary query index

  2. Fix Function Search Path
    - Recreate `update_updated_at_column` function with immutable search_path
    - Use SECURITY INVOKER and explicit schema qualification
    - This prevents privilege escalation attacks via search_path manipulation

  3. Important Notes
    - Removing unused indexes improves write performance and reduces storage
    - Immutable search_path is a critical security requirement for functions
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_arbitrage_category;
DROP INDEX IF EXISTS idx_arbitrage_created;

-- Drop and recreate the function with proper security settings
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger since CASCADE dropped it
DROP TRIGGER IF EXISTS update_arbitrage_opportunities_updated_at ON arbitrage_opportunities;

CREATE TRIGGER update_arbitrage_opportunities_updated_at 
  BEFORE UPDATE ON arbitrage_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
