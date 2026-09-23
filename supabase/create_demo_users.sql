-- ==============================================================================
-- STUDYHUB - CREATE DEMO USERS IN SUPABASE AUTH & PROFILES
-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ywivwjbwzwjoblbpkdwi/sql/new
--
-- This script creates pre-confirmed demo users in Supabase Auth so you can 
-- log in with email and password directly:
--
-- 1. Admin:
--    Email:    admin@studyhub.com
--    Password: Admin@123456
--    Role:     admin
--
-- 2. Moderator:
--    Email:    moderator@studyhub.com
--    Password: Moderator@123456
--    Role:     moderator
--
-- 3. Student:
--    Email:    student@studyhub.com
--    Password: Student@123456
--    Role:     student
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Insert or Update Demo Admin in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated',
  'authenticated',
  'admin@studyhub.com',
  crypt('Admin@123456', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"StudyHub Administrator","role":"admin"}',
  NOW(),
  NOW(),
  ''
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('Admin@123456', gen_salt('bf')),
  email_confirmed_at = NOW(),
  raw_user_meta_data = '{"full_name":"StudyHub Administrator","role":"admin"}';

-- 2. Insert or Update Demo Moderator in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'moderator@studyhub.com',
  crypt('Moderator@123456', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"David Chen (Moderator)","role":"moderator"}',
  NOW(),
  NOW(),
  ''
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('Moderator@123456', gen_salt('bf')),
  email_confirmed_at = NOW(),
  raw_user_meta_data = '{"full_name":"David Chen (Moderator)","role":"moderator"}';

-- 3. Insert or Update Demo Student in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'student@studyhub.com',
  crypt('Student@123456', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Priya Sharma (Student)","role":"student"}',
  NOW(),
  NOW(),
  ''
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('Student@123456', gen_salt('bf')),
  email_confirmed_at = NOW(),
  raw_user_meta_data = '{"full_name":"Priya Sharma (Student)","role":"student"}';

-- 4. Sync with public.profiles
INSERT INTO public.profiles (id, full_name, email, role, college, semester, department_id)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'StudyHub Administrator', 'admin@studyhub.com', 'admin', 'Anna University', 8, 'a0000000-0000-0000-0000-000000000001'),
  ('22222222-2222-2222-2222-222222222222', 'David Chen (Moderator)', 'moderator@studyhub.com', 'moderator', 'National Institute of Technology', 6, 'a0000000-0000-0000-0000-000000000002'),
  ('11111111-1111-1111-1111-111111111111', 'Priya Sharma (Student)', 'student@studyhub.com', 'student', 'College of Engineering, Guindy', 4, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;
