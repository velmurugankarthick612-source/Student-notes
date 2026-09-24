const crypto = require('crypto');
const { supabase, isConfigured } = require('../config/supabase');
const { MOCK_DEPARTMENTS } = require('../data/mockData');

// Initial seed units for core subjects
const initialUnits = [
  // Units for DBMS (CS8492)
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    subject_id: 'b0000000-0000-0000-0000-000000000004',
    unit_number: 1,
    title: 'Relational Model and SQL',
    description: 'ER diagrams, Relational Algebra, SQL queries, DDL, DML, joins, subqueries, and views.',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    subject_id: 'b0000000-0000-0000-0000-000000000004',
    unit_number: 2,
    title: 'Database Design and Normalization',
    description: 'Functional dependencies, 1NF, 2NF, 3NF, BCNF, 4NF, multi-valued dependencies, and lossy decomposition.',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    subject_id: 'b0000000-0000-0000-0000-000000000004',
    unit_number: 3,
    title: 'Transactions and Concurrency Control',
    description: 'ACID properties, serializability, two-phase locking (2PL), deadlock prevention and recovery.',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    subject_id: 'b0000000-0000-0000-0000-000000000004',
    unit_number: 4,
    title: 'Storage and Indexing',
    description: 'RAID architectures, B-trees, B+ trees, hashing techniques, and buffer pool management.',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    subject_id: 'b0000000-0000-0000-0000-000000000004',
    unit_number: 5,
    title: 'Query Optimization & Advanced Databases',
    description: 'Query processing cost estimation, NoSQL databases, MongoDB intro, and distributed databases.',
    created_at: '2025-01-01T00:00:00.000Z',
  },

  // Units for Computer Networks (CS8591)
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    subject_id: 'b0000000-0000-0000-0000-000000000005',
    unit_number: 1,
    title: 'Physical & Data Link Layer',
    description: 'OSI vs TCP/IP, framing, error detection (CRC), flow control, and sliding window protocols.',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000007',
    subject_id: 'b0000000-0000-0000-0000-000000000005',
    unit_number: 2,
    title: 'Network Layer & Routing',
    description: 'IPv4, IPv6, subnetting, CIDR, distance vector routing, link-state routing (OSPF, BGP).',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000008',
    subject_id: 'b0000000-0000-0000-0000-000000000005',
    unit_number: 3,
    title: 'Transport Layer',
    description: 'TCP 3-way handshake, UDP, congestion control algorithms, flow control, and sliding window.',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000009',
    subject_id: 'b0000000-0000-0000-0000-000000000005',
    unit_number: 4,
    title: 'Application Layer Protocols',
    description: 'HTTP/HTTPS, DNS, SMTP, FTP, socket programming, and web caching architectures.',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000010',
    subject_id: 'b0000000-0000-0000-0000-000000000005',
    unit_number: 5,
    title: 'Network Security & Wireless',
    description: 'Firewalls, IPSec, Wi-Fi 802.11 standards, and cellular network architectures.',
    created_at: '2025-01-01T00:00:00.000Z',
  },
];

// Rich, comprehensive curriculum repository across semesters 1 to 8
const initialSubjects = [
  // CSE Semester 1
  {
    id: 'b0000000-0000-0000-0000-000000000101',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 1,
    name: 'Communicative English',
    code: 'HS8151',
    description: 'Grammar, reading comprehension, listening skills, and formal technical communication.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000102',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 1,
    name: 'Engineering Mathematics I',
    code: 'MA8151',
    description: 'Differential calculus, functions of several variables, integral calculus, and multiple integrals.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000103',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 1,
    name: 'Problem Solving and Python Programming',
    code: 'GE8151',
    description: 'Algorithms, building blocks of Python, control flow, functions, lists, tuples, and file I/O.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },

  // CSE Semester 2
  {
    id: 'b0000000-0000-0000-0000-000000000104',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 2,
    name: 'Technical English',
    code: 'HS8251',
    description: 'Technical writing, report writing, presentation skills, and job interview preparation.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000105',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 2,
    name: 'Programming in C',
    code: 'CS8251',
    description: 'Basics of C programming, arrays, strings, pointers, structures, unions, and file operations.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },

  // CSE Semester 3
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 3,
    name: 'Data Structures and Algorithms',
    code: 'CS8391',
    description: 'Linear and non-linear data structures, algorithm analysis, searching, sorting, and tree balancing.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 3,
    name: 'Digital Principles and System Design',
    code: 'CS8351',
    description: 'Combinational and sequential circuits, Boolean algebra, synchronous state machines, and verilog basics.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },

  // CSE Semester 4
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 4,
    name: 'Operating Systems',
    code: 'CS8493',
    description: 'Process scheduling, concurrency, deadlocks, virtual memory management, and file system architecture.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 4,
    name: 'Database Management Systems',
    code: 'CS8492',
    description: 'Relational data model, SQL, database normalization, indexing, transaction processing, and ACID properties.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },

  // CSE Semester 5
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 5,
    name: 'Computer Networks',
    code: 'CS8591',
    description: 'OSI model, TCP/IP protocol suite, sliding window, routing algorithms, transport layer protocols, and DNS.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000006',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 5,
    name: 'Theory of Computation',
    code: 'CS8501',
    description: 'Automata theory, regular expressions, context-free grammars, pushdown automata, and Turing machines.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000020',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 5,
    name: 'Database Management Systems',
    code: 'CS501',
    description: 'Database management concepts, SQL, normalization and transaction processing.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },

  // CSE-CYBER Semester 5
  {
    id: 'b0000000-0000-0000-0000-000000000007',
    department_id: 'a0000000-0000-0000-0000-000000000002',
    semester: 5,
    name: 'Cryptography and Network Security',
    code: 'CB8501',
    description: 'Classical ciphers, DES, AES, RSA, elliptic curve cryptography, digital signatures, and SSL/TLS.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000008',
    department_id: 'a0000000-0000-0000-0000-000000000002',
    semester: 5,
    name: 'Database Management Systems',
    code: 'CB8492',
    description: 'Secure database design, SQL injections defense, relational modeling, and normalization techniques.',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
];

// In-memory repositories
let inMemorySubjects = [...initialSubjects];
let inMemoryUnits = [...initialUnits];

// Helper to attach department and units to a subject
function enrichSubject(subj) {
  const dept = MOCK_DEPARTMENTS.find((d) => d.id === subj.department_id) || {
    id: subj.department_id,
    name: 'Department',
    code: 'DEPT',
  };
  const units = inMemoryUnits
    .filter((u) => u.subject_id === subj.id)
    .sort((a, b) => a.unit_number - b.unit_number);

  return {
    ...subj,
    status: subj.status || 'active',
    department: dept,
    units,
  };
}

/**
 * GET /api/subjects
 * Supports filtering by department_id, semester, status, search.
 * Enforces role restriction: students and public only see 'active' subjects.
 */
async function getAllSubjects({ department_id, semester, status, search, role = 'student' }) {
  // If Supabase is configured, try querying Supabase first
  if (isConfigured && supabase) {
    try {
      let query = supabase
        .from('subjects')
        .select(`
          id,
          department_id,
          semester,
          name,
          code,
          description,
          status,
          created_at,
          updated_at,
          department:departments (id, name, code),
          units (id, unit_number, title, description)
        `)
        .order('semester', { ascending: true })
        .order('name', { ascending: true });

      if (department_id) {
        query = query.eq('department_id', department_id);
      }

      if (semester) {
        query = query.eq('semester', Number(semester));
      }

      // If user is student/public, only active subjects
      if (role !== 'admin' && role !== 'moderator') {
        query = query.eq('status', 'active');
      } else if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
      }

      const { data: dbSubjects, error } = await query;
      if (!error && dbSubjects && dbSubjects.length > 0) {
        return dbSubjects.map((s) => ({
          ...s,
          status: s.status || 'active',
          units: (s.units || []).sort((a, b) => a.unit_number - b.unit_number),
        }));
      }
    } catch (e) {
      // Fall through to in-memory fallback
    }
  }

  // Fallback to rich in-memory curriculum
  let result = inMemorySubjects.map(enrichSubject);

  if (department_id) {
    result = result.filter((s) => s.department_id === department_id);
  }

  if (semester) {
    result = result.filter((s) => Number(s.semester) === Number(semester));
  }

  if (role !== 'admin' && role !== 'moderator') {
    result = result.filter((s) => (s.status || 'active') === 'active');
  } else if (status && status !== 'all') {
    result = result.filter((s) => (s.status || 'active') === status);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }

  result.sort((a, b) => a.semester - b.semester || a.name.localeCompare(b.name));
  return result;
}

/**
 * GET /api/subjects/:id
 */
async function getSubjectById(id) {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          id,
          department_id,
          semester,
          name,
          code,
          description,
          status,
          created_at,
          updated_at,
          department:departments (id, name, code),
          units (id, unit_number, title, description)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        return {
          ...data,
          status: data.status || 'active',
          units: (data.units || []).sort((a, b) => a.unit_number - b.unit_number),
        };
      }
    } catch (e) {
      // Fall through
    }
  }

  const found = inMemorySubjects.find((s) => s.id === id);
  if (!found) return null;
  return enrichSubject(found);
}

/**
 * POST /api/admin/subjects
 * Only authenticated Admin.
 */
async function createSubject({ department_id, semester, name, code, description, status = 'active' }) {
  // Validate department exists
  const deptExists = MOCK_DEPARTMENTS.some((d) => d.id === department_id);
  if (!deptExists && (!isConfigured || !supabase)) {
    const error = new Error('Department does not exist.');
    error.status = 400;
    error.code = 'INVALID_DEPARTMENT';
    throw error;
  }

  const cleanCode = code ? code.trim().toUpperCase() : '';
  const cleanName = name.trim();

  // Check duplicate code
  const isDuplicate = inMemorySubjects.some(
    (s) => s.code.toUpperCase() === cleanCode && s.department_id === department_id
  );
  if (isDuplicate) {
    const error = new Error('Subject code already exists.');
    error.status = 409;
    error.code = 'DUPLICATE_SUBJECT_CODE';
    throw error;
  }

  const newSubject = {
    id: crypto.randomUUID(),
    department_id,
    semester: Number(semester),
    name: cleanName,
    code: cleanCode,
    description: description ? description.trim() : null,
    status: status || 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Attempt Supabase insert if available
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          id: newSubject.id,
          department_id: newSubject.department_id,
          semester: newSubject.semester,
          name: newSubject.name,
          code: newSubject.code,
          description: newSubject.description,
          status: newSubject.status,
        })
        .select(`
          id,
          department_id,
          semester,
          name,
          code,
          description,
          status,
          created_at,
          updated_at,
          department:departments (id, name, code)
        `)
        .single();

      if (error) {
        if (error.code === '23505') {
          const err = new Error('Subject code already exists.');
          err.status = 409;
          err.code = 'DUPLICATE_SUBJECT_CODE';
          throw err;
        }
      } else if (data) {
        inMemorySubjects.push(newSubject);
        return {
          ...data,
          status: data.status || 'active',
          units: [],
        };
      }
    } catch (e) {
      if (e.status === 409) throw e;
    }
  }

  inMemorySubjects.push(newSubject);
  return enrichSubject(newSubject);
}

/**
 * PUT /api/admin/subjects/:id
 * Only authenticated Admin.
 */
async function updateSubject(id, updates) {
  const existingIndex = inMemorySubjects.findIndex((s) => s.id === id);

  // Check code uniqueness if code is updated
  if (updates.code) {
    const cleanCode = updates.code.trim().toUpperCase();
    const deptId = updates.department_id || inMemorySubjects[existingIndex]?.department_id;
    const isDuplicate = inMemorySubjects.some(
      (s) => s.id !== id && s.code.toUpperCase() === cleanCode && s.department_id === deptId
    );
    if (isDuplicate) {
      const error = new Error('Subject code already exists.');
      error.status = 409;
      error.code = 'DUPLICATE_SUBJECT_CODE';
      throw error;
    }
  }

  // Attempt Supabase update
  if (isConfigured && supabase) {
    try {
      const dbPayload = {};
      if (updates.department_id) dbPayload.department_id = updates.department_id;
      if (updates.semester !== undefined) dbPayload.semester = Number(updates.semester);
      if (updates.name) dbPayload.name = updates.name.trim();
      if (updates.code) dbPayload.code = updates.code.trim().toUpperCase();
      if (updates.description !== undefined) dbPayload.description = updates.description;
      if (updates.status) dbPayload.status = updates.status;
      dbPayload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('subjects')
        .update(dbPayload)
        .eq('id', id)
        .select(`
          id,
          department_id,
          semester,
          name,
          code,
          description,
          status,
          created_at,
          updated_at,
          department:departments (id, name, code)
        `)
        .single();

      if (error) {
        if (error.code === '23505') {
          const err = new Error('Subject code already exists.');
          err.status = 409;
          err.code = 'DUPLICATE_SUBJECT_CODE';
          throw err;
        }
      }
    } catch (e) {
      if (e.status === 409) throw e;
    }
  }

  if (existingIndex === -1) {
    const error = new Error('Subject not found');
    error.status = 404;
    throw error;
  }

  inMemorySubjects[existingIndex] = {
    ...inMemorySubjects[existingIndex],
    ...updates,
    semester: updates.semester !== undefined ? Number(updates.semester) : inMemorySubjects[existingIndex].semester,
    code: updates.code ? updates.code.trim().toUpperCase() : inMemorySubjects[existingIndex].code,
    name: updates.name ? updates.name.trim() : inMemorySubjects[existingIndex].name,
    updated_at: new Date().toISOString(),
  };

  return enrichSubject(inMemorySubjects[existingIndex]);
}

/**
 * PATCH /api/admin/subjects/:id/status
 * Only authenticated Admin.
 */
async function updateSubjectStatus(id, status) {
  if (!['active', 'inactive'].includes(status)) {
    const error = new Error('Status must be active or inactive');
    error.status = 400;
    throw error;
  }

  return updateSubject(id, { status });
}

/**
 * DELETE /api/admin/subjects/:id
 * Only authenticated Admin.
 * Checks for dependent learning resources before deleting.
 */
async function deleteSubject(id) {
  // Check if any resources exist in Supabase for this subject
  if (isConfigured && supabase) {
    try {
      const { count } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('subject_id', id);

      if (count && count > 0) {
        const error = new Error(
          `Cannot delete subject: This subject has ${count} learning resource(s) associated with it. Please deactivate the subject instead to preserve resource links.`
        );
        error.status = 400;
        error.code = 'SUBJECT_HAS_RESOURCES';
        throw error;
      }
    } catch (e) {
      if (e.code === 'SUBJECT_HAS_RESOURCES') throw e;
    }
  }

  const existingIndex = inMemorySubjects.findIndex((s) => s.id === id);
  if (existingIndex === -1) {
    const error = new Error('Subject not found');
    error.status = 404;
    throw error;
  }

  const subjectToDelete = inMemorySubjects[existingIndex];

  // Attempt Supabase delete
  if (isConfigured && supabase) {
    try {
      await supabase.from('subjects').delete().eq('id', id);
    } catch (e) {
      // Ignore if local fallback
    }
  }

  // Remove subject and attached units in memory
  inMemorySubjects.splice(existingIndex, 1);
  inMemoryUnits = inMemoryUnits.filter((u) => u.subject_id !== id);

  return { success: true, deleted: subjectToDelete };
}

/**
 * Units Management
 */
async function getUnitsForSubject(subjectId) {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('subject_id', subjectId)
        .order('unit_number', { ascending: true });

      if (!error && data) {
        return data;
      }
    } catch (e) {
      // Fall through
    }
  }

  return inMemoryUnits
    .filter((u) => u.subject_id === subjectId)
    .sort((a, b) => a.unit_number - b.unit_number);
}

async function createUnit(subjectId, { unit_number, title, description }) {
  const cleanNumber = Number(unit_number);
  const cleanTitle = title.trim();

  // Check duplicate unit number for subject
  const duplicate = inMemoryUnits.some(
    (u) => u.subject_id === subjectId && u.unit_number === cleanNumber
  );
  if (duplicate) {
    const error = new Error(`Unit ${cleanNumber} already exists for this subject.`);
    error.status = 409;
    error.code = 'DUPLICATE_UNIT_NUMBER';
    throw error;
  }

  const newUnit = {
    id: crypto.randomUUID(),
    subject_id: subjectId,
    unit_number: cleanNumber,
    title: cleanTitle,
    description: description ? description.trim() : null,
    created_at: new Date().toISOString(),
  };

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('units')
        .insert(newUnit)
        .select()
        .single();

      if (!error && data) {
        inMemoryUnits.push(data);
        return data;
      }
    } catch (e) {
      // Fall through
    }
  }

  inMemoryUnits.push(newUnit);
  return newUnit;
}

async function updateUnit(id, updates) {
  const index = inMemoryUnits.findIndex((u) => u.id === id);

  if (updates.unit_number) {
    const cleanNumber = Number(updates.unit_number);
    const subjId = inMemoryUnits[index]?.subject_id;
    const duplicate = inMemoryUnits.some(
      (u) => u.id !== id && u.subject_id === subjId && u.unit_number === cleanNumber
    );
    if (duplicate) {
      const error = new Error(`Unit ${cleanNumber} already exists for this subject.`);
      error.status = 409;
      error.code = 'DUPLICATE_UNIT_NUMBER';
      throw error;
    }
  }

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('units')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        if (index !== -1) inMemoryUnits[index] = data;
        return data;
      }
    } catch (e) {
      // Fall through
    }
  }

  if (index === -1) {
    const error = new Error('Unit not found');
    error.status = 404;
    throw error;
  }

  inMemoryUnits[index] = {
    ...inMemoryUnits[index],
    ...updates,
    unit_number: updates.unit_number !== undefined ? Number(updates.unit_number) : inMemoryUnits[index].unit_number,
    title: updates.title ? updates.title.trim() : inMemoryUnits[index].title,
  };

  return inMemoryUnits[index];
}

async function deleteUnit(id) {
  if (isConfigured && supabase) {
    try {
      await supabase.from('units').delete().eq('id', id);
    } catch (e) {
      // Ignore
    }
  }

  const index = inMemoryUnits.findIndex((u) => u.id === id);
  if (index === -1) {
    const error = new Error('Unit not found');
    error.status = 404;
    throw error;
  }

  const deleted = inMemoryUnits.splice(index, 1)[0];
  return { success: true, deleted };
}

/**
 * Get platform curriculum statistics
 */
async function getSubjectStats() {
  const totalDepartments = MOCK_DEPARTMENTS.length;
  const totalSubjects = inMemorySubjects.length;
  const activeSubjects = inMemorySubjects.filter((s) => (s.status || 'active') === 'active').length;
  const inactiveSubjects = inMemorySubjects.filter((s) => s.status === 'inactive').length;
  const totalUnits = inMemoryUnits.length;

  return {
    totalDepartments,
    totalSubjects,
    activeSubjects,
    inactiveSubjects,
    totalUnits,
  };
}

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  updateSubjectStatus,
  deleteSubject,
  getUnitsForSubject,
  createUnit,
  updateUnit,
  deleteUnit,
  getSubjectStats,
};
