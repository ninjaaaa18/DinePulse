-- Create partner_applications table for the "Become a Restaurant Partner" workflow

CREATE TABLE IF NOT EXISTS public.partner_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending_review',
    restaurant_name TEXT NOT NULL,
    description TEXT,
    cuisine TEXT,
    address TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_application UNIQUE (user_id)
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_partner_applications_updated_at ON public.partner_applications;
CREATE TRIGGER update_partner_applications_updated_at
    BEFORE UPDATE ON public.partner_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partner_applications_user_id ON public.partner_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_applications_status ON public.partner_applications(status);

-- RLS
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow user manage own application" ON public.partner_applications;
CREATE POLICY "Allow user manage own application"
    ON public.partner_applications
    FOR ALL
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow admin manage applications" ON public.partner_applications;
CREATE POLICY "Allow admin manage applications"
    ON public.partner_applications
    FOR ALL
    USING (auth.role() = 'service_role');
