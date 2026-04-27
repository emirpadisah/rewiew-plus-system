ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS package_tier TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'businesses_package_tier_check'
  ) THEN
    ALTER TABLE businesses
    ADD CONSTRAINT businesses_package_tier_check
    CHECK (package_tier IN ('starter', 'standard', 'pro'));
  END IF;
END $$;
