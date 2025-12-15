-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'passive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_payment_at TIMESTAMP WITH TIME ZONE,
  next_renewal_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_created_at ON businesses(created_at);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'business')),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_business_id ON users(business_id);
CREATE INDEX idx_users_role ON users(role);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL, -- E.164 format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_business_phone ON customers(business_id, phone);

-- WhatsApp connections table
CREATE TABLE whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
  instance_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('connected', 'disconnected', 'pending')),
  last_seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_connections_business_id ON whatsapp_connections(business_id);
CREATE INDEX idx_whatsapp_connections_status ON whatsapp_connections(status);

-- Message logs table
CREATE TABLE message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_message_logs_business_id ON message_logs(business_id);
CREATE INDEX idx_message_logs_customer_id ON message_logs(customer_id);
CREATE INDEX idx_message_logs_status ON message_logs(status);
CREATE INDEX idx_message_logs_created_at ON message_logs(created_at);
CREATE INDEX idx_message_logs_business_created ON message_logs(business_id, created_at);

-- Business settings table (for review platform and URL)
CREATE TABLE business_settings (
  business_id UUID PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
  review_platform VARCHAR(20) NOT NULL DEFAULT 'google' CHECK (review_platform IN ('google', 'tripadvisor', 'custom')),
  review_url TEXT,
  message_template TEXT DEFAULT 'Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_business_settings_business_id ON business_settings(business_id);

