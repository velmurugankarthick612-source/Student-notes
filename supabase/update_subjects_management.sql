-- ==============================================================================
-- STUDYHUB - SUBJECT MANAGEMENT DATABASE SCHEMA & RLS MIGRATION
-- Adds status column, constraints, and strict admin RLS policies for subjects
-- ==============================================================================

-- 1. Add status column to subjects if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'subjects' 
          AND column_name = 'status'
    ) THEN
        ALTER TABLE public.subjects 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive'));
    END IF;
END $$;

-- 2. Ensure code is NOT NULL and add uniqueness constraint within department
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'uq_subjects_dept_code'
    ) THEN
        ALTER TABLE public.subjects 
        ADD CONSTRAINT uq_subjects_dept_code UNIQUE (department_id, code);
    END IF;
END $$;

-- 3. Create index for fast status and code lookups
CREATE INDEX IF NOT EXISTS idx_subjects_status ON public.subjects(status);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(code);

-- 4. Update Row Level Security Policies for subjects
DROP POLICY IF EXISTS "Subjects are viewable by everyone" ON public.subjects;
DROP POLICY IF EXISTS "Active subjects are viewable by students, all by staff" ON public.subjects;
DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admins can insert subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admins can update subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admins can delete subjects" ON public.subjects;

-- Students/Public see active subjects; staff/admin see all
CREATE POLICY "Active subjects are viewable by students, all by staff"
    ON public.subjects FOR SELECT
    USING (
        status = 'active'
        OR public.is_moderator_or_admin()
    );

CREATE POLICY "Admins can insert subjects"
    ON public.subjects FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update subjects"
    ON public.subjects FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete subjects"
    ON public.subjects FOR DELETE
    USING (public.is_admin());

-- 5. Update Row Level Security Policies for units
DROP POLICY IF EXISTS "Units are viewable by everyone" ON public.units;
DROP POLICY IF EXISTS "Admins can manage units" ON public.units;
DROP POLICY IF EXISTS "Admins can insert units" ON public.units;
DROP POLICY IF EXISTS "Admins can update units" ON public.units;
DROP POLICY IF EXISTS "Admins can delete units" ON public.units;

CREATE POLICY "Units are viewable by everyone"
    ON public.units FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert units"
    ON public.units FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update units"
    ON public.units FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete units"
    ON public.units FOR DELETE
    USING (public.is_admin());
