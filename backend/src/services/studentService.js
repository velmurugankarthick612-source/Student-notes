const crypto = require('crypto');
const { supabase, isConfigured } = require('../config/supabase');
const { logAdminAction } = require('./auditService');
const { MOCK_DEPARTMENTS } = require('../data/mockData');

// Initial in-memory student repository for reliable operation across all environments
const inMemoryStudents = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    full_name: 'Priya Sharma (Demo Student)',
    register_number: 'REG2024001',
    email: 'student@studyhub.com',
    password_hash: hashPassword('Student@123456'),
    college: 'College of Engineering, Guindy',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 4,
    phone: '9876543210',
    role: 'student',
    status: 'active',
    created_at: new Date('2025-01-15T10:00:00.000Z').toISOString(),
    updated_at: new Date('2025-01-15T10:00:00.000Z').toISOString(),
  },
  {
    id: '11111111-1111-1111-1111-111111111112',
    full_name: 'Karthik Raja',
    register_number: 'REG2024002',
    email: 'karthik.raja@student.studyhub.edu',
    password_hash: hashPassword('Student@123456'),
    college: 'Anna University Campus',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 4,
    phone: '9876543211',
    role: 'student',
    status: 'active',
    created_at: new Date('2025-01-16T11:30:00.000Z').toISOString(),
    updated_at: new Date('2025-01-16T11:30:00.000Z').toISOString(),
  },
  {
    id: '11111111-1111-1111-1111-111111111113',
    full_name: 'Sneha Patel',
    register_number: 'REG2024003',
    email: 'sneha.patel@student.studyhub.edu',
    password_hash: hashPassword('Student@123456'),
    college: 'National Institute of Technology',
    department_id: 'a0000000-0000-0000-0000-000000000002',
    semester: 6,
    phone: '9876543212',
    role: 'student',
    status: 'inactive',
    created_at: new Date('2025-01-18T14:15:00.000Z').toISOString(),
    updated_at: new Date('2025-01-20T09:00:00.000Z').toISOString(),
  },
];

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function safeStudent(student) {
  if (!student) return null;
  const { password_hash, ...safe } = student;
  // Ensure department object is attached if not already present
  if (!safe.department && safe.department_id) {
    safe.department = MOCK_DEPARTMENTS.find((d) => d.id === safe.department_id) || null;
  }
  return safe;
}

/**
 * Check for duplicate email or register_number
 */
async function checkDuplicates({ email, register_number, excludeId = null }) {
  const normEmail = email ? email.trim().toLowerCase() : null;
  const normRegNo = register_number ? register_number.trim().toUpperCase() : null;

  // 1. Check in Supabase if configured and reachable
  if (isConfigured && supabase) {
    try {
      if (normEmail) {
        let q = supabase.from('profiles').select('id, email').ilike('email', normEmail);
        if (excludeId) q = q.neq('id', excludeId);
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return { isDuplicate: true, field: 'email', message: 'A student with this email address already exists.' };
        }
      }
      if (normRegNo) {
        let q = supabase.from('profiles').select('id, register_number').ilike('register_number', normRegNo);
        if (excludeId) q = q.neq('id', excludeId);
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return { isDuplicate: true, field: 'register_number', message: 'A student with this register number already exists.' };
        }
      }
    } catch (e) {
      // In case database table is missing or network failure, rely on memory check
    }
  }

  // 2. Check in memory repository
  const existingEmail = inMemoryStudents.find(
    (s) => s.email.toLowerCase() === normEmail && s.id !== excludeId
  );
  if (existingEmail) {
    return { isDuplicate: true, field: 'email', message: 'A student with this email address already exists.' };
  }

  const existingRegNo = inMemoryStudents.find(
    (s) => (s.register_number || '').toUpperCase() === normRegNo && s.id !== excludeId
  );
  if (existingRegNo) {
    return { isDuplicate: true, field: 'register_number', message: 'A student with this register number already exists.' };
  }

  return { isDuplicate: false };
}

/**
 * Create a new student account
 */
async function createStudent(studentData, adminUser) {
  const {
    full_name,
    register_number,
    email,
    password,
    college,
    department_id,
    semester,
    phone,
    status = 'active',
  } = studentData;

  // 1. Check duplicate email or register_number
  const dupCheck = await checkDuplicates({ email, register_number });
  if (dupCheck.isDuplicate) {
    const error = new Error(dupCheck.message);
    error.status = 409;
    error.code = dupCheck.field === 'email' ? 'DUPLICATE_EMAIL' : 'DUPLICATE_REGISTER_NUMBER';
    throw error;
  }

  let userId = crypto.randomUUID();
  let createdInSupabaseAuth = false;

  // 2. Create in Supabase Auth via admin API if configured
  if (isConfigured && supabase) {
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email.trim(),
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: full_name.trim(),
          role: 'student',
          college: college.trim(),
          department_id,
          semester: Number(semester),
          register_number: register_number.trim(),
          phone: phone ? phone.trim() : null,
          status,
        },
      });

      if (!authError && authUser?.user?.id) {
        userId = authUser.user.id;
        createdInSupabaseAuth = true;

        // Create or update profile in public.profiles table
        const profilePayload = {
          id: userId,
          full_name: full_name.trim(),
          register_number: register_number.trim(),
          email: email.trim().toLowerCase(),
          college: college.trim(),
          department_id: department_id || null,
          semester: Number(semester),
          phone: phone ? phone.trim() : null,
          role: 'student',
          status: status || 'active',
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase.from('profiles').upsert(profilePayload);
        if (profileError) {
          console.warn('Profile upsert warning in createStudent:', profileError.message);
        }
      } else if (authError) {
        console.warn('Supabase auth.admin.createUser warning:', authError.message);
      }
    } catch (err) {
      console.warn('Supabase admin create error (fallback to local student store):', err.message);
    }
  }

  // 3. Store in memory repository
  const now = new Date().toISOString();
  const newStudent = {
    id: userId,
    full_name: full_name.trim(),
    register_number: register_number.trim().toUpperCase(),
    email: email.trim().toLowerCase(),
    password_hash: hashPassword(password),
    college: college.trim(),
    department_id,
    semester: Number(semester),
    phone: phone ? phone.trim() : '',
    role: 'student',
    status: status || 'active',
    created_at: now,
    updated_at: now,
  };

  inMemoryStudents.unshift(newStudent);

  // 4. Record Audit Log
  await logAdminAction({
    adminId: adminUser?.id || null,
    action: 'STUDENT_CREATED',
    targetUserId: userId,
    details: {
      full_name: newStudent.full_name,
      email: newStudent.email,
      register_number: newStudent.register_number,
      department_id: newStudent.department_id,
      semester: newStudent.semester,
      status: newStudent.status,
      created_in_supabase_auth: createdInSupabaseAuth,
    },
  });

  return safeStudent(newStudent);
}

/**
 * Get paginated & filtered list of students
 */
async function getStudents({ search, department_id, semester, status, page = 1, limit = 20 }) {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);

  // Attempt Supabase fetch
  if (isConfigured && supabase) {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          register_number,
          email,
          college,
          department_id,
          semester,
          phone,
          role,
          status,
          created_at,
          updated_at,
          department:departments(id, name, code)
        `, { count: 'exact' })
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (department_id && department_id !== 'all') {
        query = query.eq('department_id', department_id);
      }
      if (semester && semester !== 'all') {
        query = query.eq('semester', Number(semester));
      }
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      if (search && search.trim()) {
        const term = search.trim();
        query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,register_number.ilike.%${term}%,college.ilike.%${term}%`);
      }

      const offset = (pageNum - 1) * limitNum;
      const { data, count, error } = await query.range(offset, offset + limitNum - 1);

      if (!error && data && data.length > 0) {
        return {
          students: data.map(safeStudent),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: count || data.length,
            totalPages: Math.ceil((count || data.length) / limitNum) || 1,
          },
        };
      }
    } catch (e) {
      // Fall through to memory
    }
  }

  // Memory filtering
  let filtered = [...inMemoryStudents];

  if (department_id && department_id !== 'all') {
    filtered = filtered.filter((s) => s.department_id === department_id);
  }
  if (semester && semester !== 'all') {
    filtered = filtered.filter((s) => Number(s.semester) === Number(semester));
  }
  if (status && status !== 'all') {
    filtered = filtered.filter((s) => s.status === status);
  }
  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.full_name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        (s.register_number && s.register_number.toLowerCase().includes(term)) ||
        (s.college && s.college.toLowerCase().includes(term))
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const offset = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(offset, offset + limitNum);

  return {
    students: paginated.map(safeStudent),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
  };
}

/**
 * Get student by ID
 */
async function getStudentById(id) {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          register_number,
          email,
          college,
          department_id,
          semester,
          phone,
          role,
          status,
          created_at,
          updated_at,
          department:departments(id, name, code)
        `)
        .eq('id', id)
        .eq('role', 'student')
        .maybeSingle();

      if (!error && data) {
        return safeStudent(data);
      }
    } catch (e) {}
  }

  const match = inMemoryStudents.find((s) => s.id === id);
  if (!match) {
    return null;
  }
  return safeStudent(match);
}

/**
 * Update student details
 */
async function updateStudent(id, updateData, adminUser) {
  // Check duplicate email or reg no if changed
  if (updateData.email || updateData.register_number) {
    const dupCheck = await checkDuplicates({
      email: updateData.email,
      register_number: updateData.register_number,
      excludeId: id,
    });
    if (dupCheck.isDuplicate) {
      const error = new Error(dupCheck.message);
      error.status = 409;
      error.code = dupCheck.field === 'email' ? 'DUPLICATE_EMAIL' : 'DUPLICATE_REGISTER_NUMBER';
      throw error;
    }
  }

  let updatedStudent = null;

  // Update in memory
  const idx = inMemoryStudents.findIndex((s) => s.id === id);
  if (idx !== -1) {
    const existing = inMemoryStudents[idx];
    inMemoryStudents[idx] = {
      ...existing,
      ...updateData,
      role: 'student', // Enforce role is always student
      updated_at: new Date().toISOString(),
    };
    updatedStudent = inMemoryStudents[idx];
  }

  // Update in Supabase if configured
  if (isConfigured && supabase) {
    try {
      const payload = {
        ...updateData,
        role: 'student',
        updated_at: new Date().toISOString(),
      };
      // Never allow password in profiles table
      delete payload.password;
      delete payload.temporary_password;

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', id)
        .select(`
          id,
          full_name,
          register_number,
          email,
          college,
          department_id,
          semester,
          phone,
          role,
          status,
          created_at,
          updated_at,
          department:departments(id, name, code)
        `)
        .maybeSingle();

      if (!error && data) {
        updatedStudent = data;
      }
    } catch (err) {
      console.warn('Supabase updateStudent error:', err.message);
    }
  }

  if (!updatedStudent) {
    const error = new Error('Student not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Record Audit Log
  await logAdminAction({
    adminId: adminUser?.id || null,
    action: 'STUDENT_UPDATED',
    targetUserId: id,
    details: updateData,
  });

  return safeStudent(updatedStudent);
}

/**
 * Toggle student status (active/inactive)
 */
async function updateStudentStatus(id, status, adminUser) {
  if (!['active', 'inactive'].includes(status)) {
    const error = new Error("Status must be either 'active' or 'inactive'");
    error.status = 400;
    error.code = 'INVALID_STATUS';
    throw error;
  }

  let updated = null;

  const idx = inMemoryStudents.findIndex((s) => s.id === id);
  if (idx !== -1) {
    inMemoryStudents[idx].status = status;
    inMemoryStudents[idx].updated_at = new Date().toISOString();
    updated = inMemoryStudents[idx];
  }

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (!error && data) {
        updated = data;
      }
    } catch (err) {
      console.warn('Supabase updateStudentStatus error:', err.message);
    }
  }

  if (!updated) {
    const error = new Error('Student not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Record Audit Log
  const action = status === 'active' ? 'STUDENT_ACTIVATED' : 'STUDENT_DEACTIVATED';
  await logAdminAction({
    adminId: adminUser?.id || null,
    action,
    targetUserId: id,
    details: { status },
  });

  return safeStudent(updated);
}

/**
 * Permanently delete student account
 */
async function deleteStudent(id, adminUser) {
  let found = false;

  const idx = inMemoryStudents.findIndex((s) => s.id === id);
  if (idx !== -1) {
    inMemoryStudents.splice(idx, 1);
    found = true;
  }

  if (isConfigured && supabase) {
    try {
      // 1. Delete from profiles
      await supabase.from('profiles').delete().eq('id', id);
      // 2. Delete from auth.users
      await supabase.auth.admin.deleteUser(id);
      found = true;
    } catch (err) {
      console.warn('Supabase deleteStudent error:', err.message);
    }
  }

  if (!found) {
    const error = new Error('Student not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Record Audit Log
  await logAdminAction({
    adminId: adminUser?.id || null,
    action: 'STUDENT_DELETED',
    targetUserId: id,
    details: { deleted_at: new Date().toISOString() },
  });

  return true;
}

/**
 * Authenticate student credentials (fallback & test support)
 */
async function authenticateStudent(email, password) {
  const normEmail = (email || '').trim().toLowerCase();
  const hash = hashPassword(password || '');

  const match = inMemoryStudents.find((s) => s.email.toLowerCase() === normEmail);
  if (!match || match.password_hash !== hash) {
    return { success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' };
  }

  if (match.status === 'inactive') {
    return {
      success: false,
      deactivated: true,
      error: 'ACCOUNT_DEACTIVATED',
      message: 'Your account has been deactivated. Please contact your administrator.',
    };
  }

  return {
    success: true,
    user: safeStudent(match),
    token: `student-token-${match.id}`,
  };
}

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
  authenticateStudent,
  checkDuplicates,
};
