-- ==============================================================================
-- STUDYHUB - ROW LEVEL SECURITY (RLS) & STORAGE POLICIES
-- ==============================================================================

-- Helper functions to check user roles safely without recursive policy loops
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- ENABLE RLS ON ALL TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile (cannot escalate role)"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND (
            role = (SELECT role FROM public.profiles WHERE id = auth.uid())
            OR public.is_admin()
        )
    );

CREATE POLICY "Admins can perform any operation on profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- DEPARTMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Departments are viewable by everyone"
    ON public.departments FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage departments"
    ON public.departments FOR ALL
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- SUBJECTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Subjects are viewable by everyone"
    ON public.subjects FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage subjects"
    ON public.subjects FOR ALL
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- UNITS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Units are viewable by everyone"
    ON public.units FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage units"
    ON public.units FOR ALL
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- RESOURCES POLICIES
-- ------------------------------------------------------------------------------
-- 1. View approved resources (public)
CREATE POLICY "Approved resources are viewable by everyone"
    ON public.resources FOR SELECT
    USING (
        status = 'approved'
        OR auth.uid() = uploaded_by
        OR public.is_moderator_or_admin()
    );

-- 2. Insert resources (authenticated users can submit pending resources)
CREATE POLICY "Authenticated users can submit resources"
    ON public.resources FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND auth.uid() = uploaded_by
        AND (status = 'pending' OR public.is_moderator_or_admin())
    );

-- 3. Update resources (owners can edit pending; moderators/admins can approve/reject)
CREATE POLICY "Owners can update pending resources or moderators/admins can update any"
    ON public.resources FOR UPDATE
    USING (
        (auth.uid() = uploaded_by AND status = 'pending')
        OR public.is_moderator_or_admin()
    )
    WITH CHECK (
        (auth.uid() = uploaded_by AND status = 'pending')
        OR public.is_moderator_or_admin()
    );

-- 4. Delete resources (owner can delete own pending; admin can delete any)
CREATE POLICY "Owners can delete own pending resources or admins can delete any"
    ON public.resources FOR DELETE
    USING (
        (auth.uid() = uploaded_by AND status = 'pending')
        OR public.is_admin()
    );

-- ------------------------------------------------------------------------------
-- BOOKMARKS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own bookmarks"
    ON public.bookmarks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
    ON public.bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
    ON public.bookmarks FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RATINGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Ratings are viewable by everyone"
    ON public.ratings FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own ratings"
    ON public.ratings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
    ON public.ratings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings or admins can delete any"
    ON public.ratings FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- REPORTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own reports and staff can view all"
    ON public.reports FOR SELECT
    USING (auth.uid() = reported_by OR public.is_moderator_or_admin());

CREATE POLICY "Authenticated users can submit reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Moderators and admins can update reports"
    ON public.reports FOR UPDATE
    USING (public.is_moderator_or_admin())
    WITH CHECK (public.is_moderator_or_admin());

CREATE POLICY "Admins can delete reports"
    ON public.reports FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- TAGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Tags are viewable by everyone"
    ON public.tags FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users or admins can manage tags"
    ON public.tags FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Resource tags are viewable by everyone"
    ON public.resource_tags FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users or admins can manage resource tags"
    ON public.resource_tags FOR ALL
    USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- STORAGE BUCKET CONFIGURATION & POLICIES
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for the 'resources' bucket
CREATE POLICY "Allow public read access to resources bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resources');

CREATE POLICY "Allow authenticated users to upload to resources bucket"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'resources'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow owners and admins to update or delete resources"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'resources'
        AND (auth.uid() = owner OR public.is_admin())
    );

CREATE POLICY "Allow owners and admins to delete resources"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'resources'
        AND (auth.uid() = owner OR public.is_admin())
    );
