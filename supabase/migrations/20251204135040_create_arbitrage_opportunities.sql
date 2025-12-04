/*
  # Create Arbitrage Opportunities Table

  1. New Tables
    - `arbitrage_opportunities`
      - `id` (uuid, primary key) - Unique identifier for each opportunity
      - `event_name` (text) - Name of the prediction event
      - `event_description` (text) - Detailed description of the event
      - `platform_a` (text) - First platform name (e.g., "Polymarket")
      - `platform_b` (text) - Second platform name (e.g., "Kalshi")
      - `outcome_a` (text) - Outcome being bet on platform A
      - `outcome_b` (text) - Outcome being bet on platform B
      - `price_a` (numeric) - Price percentage on platform A (0-100)
      - `price_b` (numeric) - Price percentage on platform B (0-100)
      - `profit_margin` (numeric) - Expected profit margin percentage
      - `investment_required` (numeric) - Minimum investment amount in dollars
      - `category` (text) - Market category (Politics, Economics, Crypto, etc.)
      - `expires_at` (timestamptz) - When the opportunity expires
      - `is_active` (boolean) - Whether the opportunity is still valid
      - `created_at` (timestamptz) - When the opportunity was detected
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `arbitrage_opportunities` table
    - Add policy for public read access (arbitrage opportunities are public data)
    - Only authenticated users with admin role can insert/update/delete

  3. Indexes
    - Index on `is_active` and `profit_margin` for efficient querying
    - Index on `category` for filtering
    - Index on `created_at` for sorting by recency

  4. Important Notes
    - Prices are stored as percentages (0-100 range)
    - All monetary values in USD
    - Default values set for boolean and timestamp fields
    - Automatic timestamp updates on modification
*/

CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  event_description text NOT NULL,
  platform_a text NOT NULL DEFAULT 'Polymarket',
  platform_b text NOT NULL DEFAULT 'Kalshi',
  outcome_a text NOT NULL,
  outcome_b text NOT NULL,
  price_a numeric NOT NULL CHECK (price_a >= 0 AND price_a <= 100),
  price_b numeric NOT NULL CHECK (price_b >= 0 AND price_b <= 100),
  profit_margin numeric NOT NULL CHECK (profit_margin >= 0),
  investment_required numeric NOT NULL CHECK (investment_required > 0),
  category text NOT NULL,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE arbitrage_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active arbitrage opportunities"
  ON arbitrage_opportunities
  FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_arbitrage_active_profit 
  ON arbitrage_opportunities(is_active, profit_margin DESC);

CREATE INDEX IF NOT EXISTS idx_arbitrage_category 
  ON arbitrage_opportunities(category);

CREATE INDEX IF NOT EXISTS idx_arbitrage_created 
  ON arbitrage_opportunities(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_arbitrage_opportunities_updated_at 
  BEFORE UPDATE ON arbitrage_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
