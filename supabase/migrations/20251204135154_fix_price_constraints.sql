/*
  # Fix Price Constraints

  1. Changes
    - Drop existing price check constraints
    - Add new constraints allowing prices from 0 to 100 (percentage format)
    - This allows storing prices as whole numbers (e.g., 45 instead of 0.45)

  2. Notes
    - Prices will be stored as percentages (0-100 range)
    - This makes it easier to display and work with in the UI
*/

ALTER TABLE arbitrage_opportunities DROP CONSTRAINT IF EXISTS arbitrage_opportunities_price_a_check;
ALTER TABLE arbitrage_opportunities DROP CONSTRAINT IF EXISTS arbitrage_opportunities_price_b_check;

ALTER TABLE arbitrage_opportunities 
  ADD CONSTRAINT arbitrage_opportunities_price_a_check 
  CHECK (price_a >= 0 AND price_a <= 100);

ALTER TABLE arbitrage_opportunities 
  ADD CONSTRAINT arbitrage_opportunities_price_b_check 
  CHECK (price_b >= 0 AND price_b <= 100);
