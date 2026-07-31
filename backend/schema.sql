-- 1. Departments Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    dept_name VARCHAR(100) UNIQUE NOT NULL
);

-- 2. Bus Routes Table
CREATE TABLE bus_routes (
    id SERIAL PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    bus_number VARCHAR(20),
    capacity INTEGER
);

-- 3. Modified Students Table (Linked to Dept and Route)
-- member_type lets the same table hold both students and staff,
-- so the bus/fee system isn't limited to students only.
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    member_type VARCHAR(10) NOT NULL DEFAULT 'student' CHECK (member_type IN ('student', 'staff')),
    department_id INTEGER REFERENCES departments(id),
    route_id INTEGER REFERENCES bus_routes(id),
    fee_status VARCHAR(20) DEFAULT 'unpaid',
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Faculty Table (Professors/Staff)
CREATE TABLE faculty (
    id SERIAL PRIMARY KEY,
    faculty_name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    route_id INTEGER REFERENCES bus_routes(id),
    designation VARCHAR(50)
);

-- 5. Transport Staff (Drivers/Conductors)
CREATE TABLE transport_staff (
    id SERIAL PRIMARY KEY,
    staff_name VARCHAR(100) NOT NULL,
    role VARCHAR(50), -- e.g., Driver, Conductor
    route_id INTEGER REFERENCES bus_routes(id),
    phone VARCHAR(20)
);

-- Seed Initial Data
INSERT INTO departments (dept_name) VALUES
    ('Computer Science'),
    ('Mechanical'),
    ('Civil'),
    ('Electrical'),
    ('Electronics & Communication'),
    ('Architecture'),
    ('Business Administration'),
    ('Information Technology'),
    ('Hotel Management'),
    ('Administration');

-- Routes named after real places around Kavrepalanchok, Nepal
INSERT INTO bus_routes (route_name, bus_number, capacity) VALUES
    ('Route A - Dhulikhel', 'B-01', 40),
    ('Route B - Banepa', 'B-02', 40),
    ('Route C - Panauti', 'B-03', 32),
    ('Route D - Panchkhal', 'B-04', 32),
    ('Route E - Nala', 'B-05', 28),
    ('Route F - Dhungkharka', 'B-06', 28),
    ('Route G - Namobuddha', 'B-07', 24),
    ('Route H - Khopasi', 'B-08', 24),
    ('Route I - Mahadevsthan', 'B-09', 24),
    ('Route J - Sathighar Bhagawati', 'B-10', 20);