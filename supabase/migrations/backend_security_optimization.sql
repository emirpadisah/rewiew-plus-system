CREATE TABLE IF NOT EXISTS login_rate_limits (
  normalized_email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL,
  last_attempt_at TIMESTAMPTZ NOT NULL,
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (normalized_email, ip_address)
);

CREATE INDEX IF NOT EXISTS idx_login_rate_limits_blocked_until
  ON login_rate_limits(blocked_until);

CREATE INDEX IF NOT EXISTS idx_message_logs_business_created_at
  ON message_logs(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_logs_business_status_created_at
  ON message_logs(business_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customers_business_created_at
  ON customers(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_templates_business_default
  ON message_templates(business_id, is_default);

WITH ranked_defaults AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY business_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
    ) AS row_number
  FROM message_templates
  WHERE is_default = true
)
UPDATE message_templates
SET is_default = false
WHERE id IN (
  SELECT id
  FROM ranked_defaults
  WHERE row_number > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_message_templates_default_per_business
  ON message_templates(business_id)
  WHERE is_default = true;

CREATE OR REPLACE FUNCTION get_message_stats_by_business()
RETURNS TABLE (
  business_id UUID,
  business_name TEXT,
  total BIGINT,
  sent BIGINT,
  failed BIGINT,
  success_rate INTEGER,
  last_message_at TIMESTAMPTZ
)
LANGUAGE sql
AS $$
  SELECT
    message_logs.business_id,
    businesses.name AS business_name,
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE message_logs.status = 'sent')::BIGINT AS sent,
    COUNT(*) FILTER (WHERE message_logs.status = 'failed')::BIGINT AS failed,
    CASE
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND(
        (COUNT(*) FILTER (WHERE message_logs.status = 'sent')) * 100.0 / COUNT(*)
      )::INTEGER
    END AS success_rate,
    MAX(message_logs.created_at) AS last_message_at
  FROM message_logs
  INNER JOIN businesses
    ON businesses.id = message_logs.business_id
  GROUP BY message_logs.business_id, businesses.name
  ORDER BY total DESC;
$$;
