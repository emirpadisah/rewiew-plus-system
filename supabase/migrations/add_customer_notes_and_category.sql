-- Add notes and category columns to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add index for category for faster filtering
CREATE INDEX IF NOT EXISTS idx_customers_category ON customers(category) WHERE category IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN customers.notes IS 'Customer notes and additional information';
COMMENT ON COLUMN customers.category IS 'Customer category for segmentation (e.g., VIP, Yeni Müşteri, Düzenli)';

