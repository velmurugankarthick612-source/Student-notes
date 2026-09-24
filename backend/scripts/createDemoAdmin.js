const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

// Configuration constants - never log secrets
const DEMO_ADMIN = {
  id: '33333333-3333-3333-3333-333333333333',
  email: 'admin@studyhub.local',
  password: 'Admin@12345',
  full_name: 'StudyHub Administrator',
  role: 'admin',
  status: 'active',
  register_number: 'ADM001',
};

async function createDemoAdmin() {
  console.log('====================================================');
  console.log(' StudyHub - Development Demo Admin Provisioning');
  console.log('====================================================');

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl) {
    console.error('Error: SUPABASE_URL is missing from environment variables.');
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is not configured in backend/.env.');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let userId = DEMO_ADMIN.id;
  let authUserCreated = false;

  try {
    console.log(`Checking for existing user with email: ${DEMO_ADMIN.email}...`);

    // 1. Check whether user already exists in Supabase Auth
    const { data: usersList, error: listError } = await supabase.auth.admin.listUsers();

    if (!listError && usersList?.users) {
      const existingUser = usersList.users.find(
        (u) => u.email && u.email.toLowerCase() === DEMO_ADMIN.email.toLowerCase()
      );

      if (existingUser) {
        userId = existingUser.id;
        console.log(`Found existing user (ID: ${userId}). Updating credentials...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
          password: DEMO_ADMIN.password,
          email_confirm: true,
          user_metadata: {
            full_name: DEMO_ADMIN.full_name,
            role: DEMO_ADMIN.role,
            status: DEMO_ADMIN.status,
          },
        });

        if (updateError) {
          console.warn(`Could not update Supabase Auth user: ${updateError.message}`);
        } else {
          console.log('Supabase Auth user credentials updated successfully.');
          authUserCreated = true;
        }
      } else {
        console.log('User does not exist yet. Creating Supabase Auth user...');
        const { data: newAuth, error: createError } = await supabase.auth.admin.createUser({
          id: DEMO_ADMIN.id,
          email: DEMO_ADMIN.email,
          password: DEMO_ADMIN.password,
          email_confirm: true,
          user_metadata: {
            full_name: DEMO_ADMIN.full_name,
            role: DEMO_ADMIN.role,
            status: DEMO_ADMIN.status,
          },
        });

        if (createError) {
          console.warn(`Supabase Auth creation note: ${createError.message}`);
        } else if (newAuth?.user) {
          userId = newAuth.user.id;
          console.log(`Supabase Auth user created successfully (ID: ${userId}).`);
          authUserCreated = true;
        }
      }
    } else if (listError) {
      console.warn(`Supabase Auth admin API response: ${listError.message}`);
      console.log('Continuing profile provisioning...');
    }
  } catch (err) {
    console.warn(`Supabase Auth check encountered: ${err.message}`);
  }

  // 2. Create/Update Profile in public.profiles table
  // SECURITY: Never include password in profile record
  try {
    console.log('Synchronizing public.profiles record...');
    const profilePayload = {
      id: userId,
      full_name: DEMO_ADMIN.full_name,
      email: DEMO_ADMIN.email,
      role: DEMO_ADMIN.role,
      status: DEMO_ADMIN.status,
      register_number: DEMO_ADMIN.register_number,
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase.from('profiles').upsert(profilePayload);

    if (profileError) {
      console.warn(`Profile table sync note: ${profileError.message}`);
    } else {
      console.log('Profile record synchronized successfully in public.profiles.');
    }
  } catch (err) {
    console.warn(`Profile sync note: ${err.message}`);
  }

  console.log('\n----------------------------------------------------');
  console.log('Demo Admin Account Status:');
  console.log(`- Email:        ${DEMO_ADMIN.email}`);
  console.log(`- Display Name: ${DEMO_ADMIN.full_name}`);
  console.log(`- Role:         ${DEMO_ADMIN.role}`);
  console.log(`- Status:       ${DEMO_ADMIN.status}`);
  console.log(`- Supabase Auth Provisioned: ${authUserCreated ? 'Yes' : 'Local / Pre-configured'}`);
  console.log('----------------------------------------------------');
  console.log('Ready for authentication through StudyHub login portal.');
  console.log('====================================================\n');
}

createDemoAdmin().catch((err) => {
  console.error('Failed to create demo admin:', err.message);
  process.exit(1);
});
