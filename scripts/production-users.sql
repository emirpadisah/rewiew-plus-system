-- ============================================
-- PRODUCTION USERS SETUP SCRIPT
-- ============================================
-- This script:
-- 1. Deletes all test users
-- 2. Creates production admin user
-- 3. Creates production business and business user
-- ============================================

-- Step 1: Delete all existing test users
-- Delete users with test/demo/example emails
DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%example%' OR email LIKE '%demo%';

-- Delete all users except our production ones (if they exist)
-- This ensures clean state
DELETE FROM users WHERE email NOT IN ('admin@rosivadijital.com', 'business@rosivadijital.com');

-- Step 2: Create production admin user
INSERT INTO users (id, email, password_hash, role, business_id, created_at)
VALUES (
  gen_random_uuid(),
  'admin@rosivadijital.com',
  '$2a$10$k31giB/pibqN5GV4sah7yuGeLgDeewI8T6DlvVg0WPz/6dWjW5GLe',
  'admin',
  NULL,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;

-- Step 3: Create production business (if not exists)
-- First, check if business exists, if not create it
DO $$
DECLARE
  business_uuid UUID;
BEGIN
  -- Check if business exists
  SELECT id INTO business_uuid FROM businesses WHERE name = 'Rosiva Dijital' LIMIT 1;
  
  -- If not exists, create it
  IF business_uuid IS NULL THEN
    INSERT INTO businesses (id, name, status, created_at, last_payment_at, next_renewal_at, notes)
    VALUES (
      gen_random_uuid(),
      'Rosiva Dijital',
      'active',
      NOW(),
      NOW(),
      NOW() + INTERVAL '1 month',
      'Production business account'
    )
    RETURNING id INTO business_uuid;
  END IF;
END $$;

-- Step 4: Create production business user
INSERT INTO users (id, email, password_hash, role, business_id, created_at)
VALUES (
  gen_random_uuid(),
  'business@rosivadijital.com',
  '$2a$10$mi.mfMkeAX10MlrVW0wqm.pEnqaCuLUHz4boGnqDL9V6FQfsWWaoG',
  'business',
  (SELECT id FROM businesses WHERE name = 'Rosiva Dijital' LIMIT 1),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  business_id = EXCLUDED.business_id;

-- Step 5: Create business settings (if not exists)
INSERT INTO business_settings (business_id, review_platform, review_url, message_template, created_at, updated_at)
SELECT 
  id,
  'custom',
  NULL,
  'Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}',
  NOW(),
  NOW()
FROM businesses
WHERE name = 'Rosiva Dijital'
ON CONFLICT (business_id) DO NOTHING;

-- ============================================
-- CREDENTIALS
-- ============================================
-- Admin:
--   Email: admin@rosivadijital.com
--   Password: RosivaAdmin2024!@#
--
-- Business:
--   Email: business@rosivadijital.com
--   Password: RosivaBusiness2024!@#
-- ============================================

