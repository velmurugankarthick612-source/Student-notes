-- ==============================================================================
-- STUDYHUB - SEED DATA
-- Sample Departments, Subjects, Units, Resources, and Tags
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DEPARTMENTS
-- ------------------------------------------------------------------------------
INSERT INTO public.departments (id, name, code, description) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Computer Science and Engineering', 'CSE', 'Focuses on computing theory, algorithms, programming, system design, and software architecture.'),
    ('a0000000-0000-0000-0000-000000000002', 'CSE Cybersecurity', 'CSE-CYBER', 'Specialized program covering network security, ethical hacking, digital forensics, and cryptography.'),
    ('a0000000-0000-0000-0000-000000000003', 'Information Technology', 'IT', 'Covers software systems, information architecture, cloud databases, web engineering, and enterprise systems.'),
    ('a0000000-0000-0000-0000-000000000004', 'Electronics and Communication Engineering', 'ECE', 'Covers semiconductor devices, embedded systems, signal processing, and communication protocols.'),
    ('a0000000-0000-0000-0000-000000000005', 'Electrical and Electronics Engineering', 'EEE', 'Deals with power systems, control engineering, power electronics, and electrical machinery.'),
    ('a0000000-0000-0000-0000-000000000006', 'Mechanical Engineering', 'MECH', 'Covers thermodynamics, fluid mechanics, CAD/CAM, structural mechanics, and manufacturing science.')
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. SUBJECTS (Sample across Semesters for CSE & CSE-CYBER)
-- ------------------------------------------------------------------------------
INSERT INTO public.subjects (id, department_id, semester, name, code, description) VALUES
    -- CSE Semester 3
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 3, 'Data Structures and Algorithms', 'CS8391', 'Linear and non-linear data structures, algorithm analysis, searching, sorting, and tree balancing.'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 3, 'Digital Principles and System Design', 'CS8351', 'Combinational and sequential circuits, Boolean algebra, synchronous state machines, and verilog basics.'),
    
    -- CSE Semester 4
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 4, 'Operating Systems', 'CS8493', 'Process scheduling, concurrency, deadlocks, virtual memory management, and file system architecture.'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 4, 'Database Management Systems', 'CS8492', 'Relational data model, SQL, database normalization, indexing, transaction processing, and ACID properties.'),
    
    -- CSE Semester 5
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 5, 'Computer Networks', 'CS8591', 'OSI model, TCP/IP protocol suite, sliding window, routing algorithms, transport layer protocols, and DNS.'),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 5, 'Theory of Computation', 'CS8501', 'Automata theory, regular expressions, context-free grammars, pushdown automata, and Turing machines.'),
    
    -- CSE-CYBER Semester 5
    ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 5, 'Cryptography and Network Security', 'CB8501', 'Classical ciphers, DES, AES, RSA, elliptic curve cryptography, digital signatures, and SSL/TLS.'),
    ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 5, 'Database Management Systems', 'CB8492', 'Secure database design, SQL injections defense, relational modeling, and normalization techniques.')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. UNITS (For Database Management Systems CS8492 & Computer Networks CS8591)
-- ------------------------------------------------------------------------------
INSERT INTO public.units (id, subject_id, unit_number, title, description) VALUES
    -- Units for DBMS (b0000000-0000-0000-0000-000000000004)
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 1, 'Relational Model and SQL', 'ER diagrams, Relational Algebra, SQL queries, DDL, DML, joins, subqueries, and views.'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 2, 'Database Design and Normalization', 'Functional dependencies, 1NF, 2NF, 3NF, BCNF, 4NF, multi-valued dependencies, and lossy decomposition.'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 3, 'Transactions and Concurrency Control', 'ACID properties, serializability, two-phase locking (2PL), deadlock prevention and recovery.'),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 4, 'Storage and Indexing', 'RAID architectures, B-trees, B+ trees, hashing techniques, and buffer pool management.'),
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 5, 'Query Optimization & Advanced Databases', 'Query processing cost estimation, NoSQL databases, MongoDB intro, and distributed databases.'),

    -- Units for Computer Networks (b0000000-0000-0000-0000-000000000005)
    ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000005', 1, 'Physical & Data Link Layer', 'OSI vs TCP/IP, framing, error detection (CRC), flow control, and sliding window protocols.'),
    ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000005', 2, 'Network Layer & Routing', 'IPv4, IPv6, subnetting, CIDR, distance vector routing, link-state routing (OSPF, BGP).'),
    ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000005', 3, 'Transport Layer', 'TCP 3-way handshake, UDP, congestion control algorithms, flow control, and sliding window.'),
    ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005', 4, 'Application Layer Protocols', 'HTTP/HTTPS, DNS, SMTP, FTP, socket programming, and web caching architectures.'),
    ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000005', 5, 'Network Security & Wireless', 'Firewalls, IPSec, Wi-Fi 802.11 standards, and cellular network architectures.')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. TAGS
-- ------------------------------------------------------------------------------
INSERT INTO public.tags (id, name) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'normalization'),
    ('d0000000-0000-0000-0000-000000000002', '1nf-2nf-3nf-bcnf'),
    ('d0000000-0000-0000-0000-000000000003', 'sql-queries'),
    ('d0000000-0000-0000-0000-000000000004', 'acid-transactions'),
    ('d0000000-0000-0000-0000-000000000005', 'tcp-ip'),
    ('d0000000-0000-0000-0000-000000000006', 'subnetting'),
    ('d0000000-0000-0000-0000-000000000007', 'cryptography'),
    ('d0000000-0000-0000-0000-000000000008', 'exam-notes'),
    ('d0000000-0000-0000-0000-000000000009', 'question-bank'),
    ('d0000000-0000-0000-0000-000000000010', 'anna-university')
ON CONFLICT (name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. SAMPLE APPROVED ACADEMIC RESOURCES
-- ------------------------------------------------------------------------------
INSERT INTO public.resources (
    id,
    title,
    description,
    subject_id,
    unit_id,
    resource_type,
    file_name,
    file_path,
    file_size,
    mime_type,
    status,
    views,
    downloads,
    created_at
) VALUES
    (
        'e0000000-0000-0000-0000-000000000001',
        'Database Normalization Complete Guide (1NF to BCNF)',
        'Comprehensive study notes with solved examples for 1NF, 2NF, 3NF, and Boyce-Codd Normal Form with functional dependency decomposition.',
        'b0000000-0000-0000-0000-000000000004',
        'c0000000-0000-0000-0000-000000000002',
        'PDF Notes',
        'dbms_unit2_normalization_notes.pdf',
        'resources/CSE/4/CS8492/sample_dbms_normalization.pdf',
        1428500,
        'application/pdf',
        'approved',
        342,
        189,
        NOW() - INTERVAL '5 days'
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'DBMS Unit 1 & 2 Question Bank with Solved Answers',
        'Curated 2-mark questions and 16-mark university questions on Relational Algebra, SQL, and Schema Decomposition.',
        'b0000000-0000-0000-0000-000000000004',
        'c0000000-0000-0000-0000-000000000002',
        'Question Bank',
        'dbms_qb_solved.pdf',
        'resources/CSE/4/CS8492/sample_dbms_qb.pdf',
        2104000,
        'application/pdf',
        'approved',
        521,
        284,
        NOW() - INTERVAL '10 days'
    ),
    (
        'e0000000-0000-0000-0000-000000000003',
        'Computer Networks TCP/IP & OSI Cheat Sheet',
        'Quick revision formula and protocol comparison sheet for semester exams. Includes layer architectures and header structures.',
        'b0000000-0000-0000-0000-000000000005',
        'c0000000-0000-0000-0000-000000000006',
        'Cheat Sheet',
        'networks_protocol_cheatsheet.pdf',
        'resources/CSE/5/CS8591/sample_networks_cheatsheet.pdf',
        894000,
        'application/pdf',
        'approved',
        612,
        420,
        NOW() - INTERVAL '14 days'
    ),
    (
        'e0000000-0000-0000-0000-000000000004',
        'Subnetting and IP Addressing Solved Numerical Problems',
        'Step-by-step solutions for CIDR notation, VLSM calculation, network ID, and broadcast address identification.',
        'b0000000-0000-0000-0000-000000000005',
        'c0000000-0000-0000-0000-000000000007',
        'Lecture Notes',
        'subnetting_problems_guide.pdf',
        'resources/CSE/5/CS8591/sample_subnetting.pdf',
        1750000,
        'application/pdf',
        'approved',
        289,
        155,
        NOW() - INTERVAL '8 days'
    ),
    (
        'e0000000-0000-0000-0000-000000000005',
        'Transactions, ACID Properties and Concurrency Control Notes',
        'Unit 3 lecture handouts detailing 2PL, Timestamp ordering, and Deadlock resolution algorithms.',
        'b0000000-0000-0000-0000-000000000004',
        'c0000000-0000-0000-0000-000000000003',
        'PDF Notes',
        'dbms_transactions_notes.pdf',
        'resources/CSE/4/CS8492/sample_dbms_transactions.pdf',
        1120000,
        'application/pdf',
        'approved',
        195,
        82,
        NOW() - INTERVAL '3 days'
    ),
    (
        'e0000000-0000-0000-0000-000000000010',
        'Database System Concepts (Silberschatz, Korth, Sudarshan - 7th Edition Reference)',
        'The definitive textbook for university database courses. Comprehensive coverage of Relational Models, Normalization, Query Optimization, and Concurrency Control.',
        'b0000000-0000-0000-0000-000000000004',
        'c0000000-0000-0000-0000-000000000002',
        'Book',
        'Database_System_Concepts_Silberschatz_7th.pdf',
        'resources/CSE/4/CS8492/silberschatz_dbms_book.pdf',
        14850000,
        'application/pdf',
        'approved',
        1240,
        890,
        NOW() - INTERVAL '20 days'
    ),
    (
        'e0000000-0000-0000-0000-000000000011',
        'Computer Networking: A Top-Down Approach (Kurose & Ross - Complete Guide)',
        'World-renowned textbook explaining computer networking from the Application Layer down through Transport, Network, and Link layers with socket programming.',
        'b0000000-0000-0000-0000-000000000005',
        'c0000000-0000-0000-0000-000000000006',
        'Book',
        'Computer_Networking_Top_Down_Approach_Kurose.pdf',
        'resources/CSE/5/CS8591/kurose_ross_networking.pdf',
        19400000,
        'application/pdf',
        'approved',
        1420,
        980,
        NOW() - INTERVAL '22 days'
    ),
    (
        'e0000000-0000-0000-0000-000000000012',
        'Introduction to Algorithms (CLRS - Cormen, Leiserson, Rivest, Stein Handout)',
        'The standard text on modern algorithm design. Covers sorting algorithms, divide and conquer, dynamic programming, and greedy algorithms.',
        'b0000000-0000-0000-0000-000000000001',
        NULL,
        'Book',
        'Introduction_To_Algorithms_CLRS_Summary.pdf',
        'resources/CSE/3/CS8391/clrs_dsa_textbook.pdf',
        18200000,
        'application/pdf',
        'approved',
        2100,
        1450,
        NOW() - INTERVAL '30 days'
    ),
    (
        'e0000000-0000-0000-0000-000000000013',
        'Cryptography and Network Security: Principles and Practice (William Stallings)',
        'Core cybersecurity textbook covering symmetric key cryptography (DES, AES), public-key cryptography (RSA, ECC), and digital signatures.',
        'b0000000-0000-0000-0000-000000000007',
        NULL,
        'Book',
        'Cryptography_Network_Security_Stallings.pdf',
        'resources/CSE-CYBER/5/CB8501/stallings_crypto_book.pdf',
        16500000,
        'application/pdf',
        'approved',
        890,
        620,
        NOW() - INTERVAL '15 days'
    )
ON CONFLICT (id) DO NOTHING;

-- Map tags to resources
INSERT INTO public.resource_tags (resource_id, tag_id) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'),
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000009'),
    ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000005'),
    ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000006')
ON CONFLICT DO NOTHING;
