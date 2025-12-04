/*
  # Fix Search Path Security Warning
  
  PostgreSQL functions should have an immutable search_path for security.
  This prevents potential SQL injection via search_path manipulation.
*/

-- Drop the old function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recreate with proper security settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- The trigger will continue to work with the updated function

