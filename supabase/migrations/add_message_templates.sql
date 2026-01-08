    -- Create message_templates table
    CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    template TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add index for faster queries
    CREATE INDEX IF NOT EXISTS idx_message_templates_business_id ON message_templates(business_id);
    CREATE INDEX IF NOT EXISTS idx_message_templates_default ON message_templates(business_id, is_default) WHERE is_default = TRUE;

    -- Add comment for documentation
    COMMENT ON TABLE message_templates IS 'Message templates for businesses to customize their review messages';
    COMMENT ON COLUMN message_templates.name IS 'Template name for easy identification';
    COMMENT ON COLUMN message_templates.template IS 'Message template with variables like {firstName} and {reviewUrl}';
    COMMENT ON COLUMN message_templates.is_default IS 'Whether this template is the default one to use';

    -- Create updated_at trigger
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_message_templates_updated_at
    BEFORE UPDATE ON message_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

