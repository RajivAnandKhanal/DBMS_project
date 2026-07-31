-- 1. Departments Table
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
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    route_id INTEGER REFERENCES bus_routes(id),
    fee_status VARCHAR(20) DEFAULT 'unpaid',
    phone VARCHAR(20)
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
INSERT INTO departments (dept_name) VALUES ('Computer Science'), ('Mechanical'), ('Civil');
INSERT INTO bus_routes (route_name, bus_number) VALUES ('Route A - North', 'B-01'), ('Route B - South', 'B-02');