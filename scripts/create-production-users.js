const bcrypt = require('bcryptjs')

const SALT_ROUNDS = 10

// Production şifreleri
const ADMIN_PASSWORD = 'RosivaAdmin2024!@#'
const BUSINESS_PASSWORD = 'RosivaBusiness2024!@#'

async function generateHashes() {
  console.log('Generating password hashes...\n')
  
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS)
  const businessHash = await bcrypt.hash(BUSINESS_PASSWORD, SALT_ROUNDS)
  
  console.log('=== PRODUCTION USERS SQL ===\n')
  console.log('-- 1. Delete all existing test users')
  console.log("DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%example%' OR email LIKE '%demo%';")
  console.log("DELETE FROM users WHERE email NOT IN ('admin@rosivadijital.com', 'business@rosivadijital.com');\n")
  
  console.log('-- 2. Create production admin user')
  console.log(`INSERT INTO users (id, email, password_hash, role, business_id, created_at)`)
  console.log(`VALUES (`)
  console.log(`  gen_random_uuid(),`)
  console.log(`  'admin@rosivadijital.com',`)
  console.log(`  '${adminHash}',`)
  console.log(`  'admin',`)
  console.log(`  NULL,`)
  console.log(`  NOW()`)
  console.log(`)`)
  console.log(`ON CONFLICT (email) DO UPDATE SET`)
  console.log(`  password_hash = EXCLUDED.password_hash,`)
  console.log(`  role = EXCLUDED.role;`)
  console.log(`\n`)
  
  console.log('-- 3. Create production business (if not exists)')
  console.log(`INSERT INTO businesses (id, name, status, created_at, last_payment_at, next_renewal_at, notes)`)
  console.log(`VALUES (`)
  console.log(`  gen_random_uuid(),`)
  console.log(`  'Rosiva Dijital',`)
  console.log(`  'active',`)
  console.log(`  NOW(),`)
  console.log(`  NOW(),`)
  console.log(`  NOW() + INTERVAL '1 month',`)
  console.log(`  'Production business account'`)
  console.log(`)`)
  console.log(`ON CONFLICT DO NOTHING;`)
  console.log(`\n`)
  
  console.log('-- 4. Create production business user')
  console.log(`INSERT INTO users (id, email, password_hash, role, business_id, created_at)`)
  console.log(`VALUES (`)
  console.log(`  gen_random_uuid(),`)
  console.log(`  'business@rosivadijital.com',`)
  console.log(`  '${businessHash}',`)
  console.log(`  'business',`)
  console.log(`  (SELECT id FROM businesses WHERE name = 'Rosiva Dijital' LIMIT 1),`)
  console.log(`  NOW()`)
  console.log(`)`)
  console.log(`ON CONFLICT (email) DO UPDATE SET`)
  console.log(`  password_hash = EXCLUDED.password_hash,`)
  console.log(`  role = EXCLUDED.role,`)
  console.log(`  business_id = EXCLUDED.business_id;`)
  console.log(`\n`)
  
  console.log('=== CREDENTIALS ===')
  console.log('\nAdmin:')
  console.log(`  Email: admin@rosivadijital.com`)
  console.log(`  Password: ${ADMIN_PASSWORD}`)
  console.log('\nBusiness:')
  console.log(`  Email: business@rosivadijital.com`)
  console.log(`  Password: ${BUSINESS_PASSWORD}`)
  console.log('\n⚠️  Keep these credentials secure!')
}

generateHashes().catch(console.error)

