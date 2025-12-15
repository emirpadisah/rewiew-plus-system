-- Add message_template column to business_settings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_settings' 
    AND column_name = 'message_template'
  ) THEN
    ALTER TABLE business_settings 
    ADD COLUMN message_template TEXT DEFAULT 'Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}';
  END IF;
END $$;

-- Update existing records to have default template if null
UPDATE business_settings 
SET message_template = 'Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}'
WHERE message_template IS NULL;

