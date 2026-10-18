DROP TABLE IF EXISTS STUDENTS;

CREATE TABLE STUDENTS (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender ENUM('MALE','FEMALE') NOT NULL,
    course VARCHAR(50),
    year_level VARCHAR(20),
    id_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    section VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    address VARCHAR(255),
    emergency_contact_name VARCHAR(100),
    emergency_contact_number VARCHAR(20),
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    role VARCHAR(20) DEFAULT 'STUDENT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO STUDENTS
(student_id, first_name, last_name, gender, course, year_level, id_number, email, section, password, contact_number, address, emergency_contact_name, emergency_contact_number, status, role, created_at)
VALUES
(1, 'Juan', 'Dela Cruz', 'MALE', 'BSIT', '1st Year', '2026001', 'juan.delacruz@email.com', 'BSIT-1A', 'pass123', '09171111111', 'Manila', 'Maria Dela Cruz', '09181111111', 'ACTIVE', 'STUDENT', '2026-09-21 21:52:50'),
(2, 'Maria', 'Santos', 'MALE', 'BSIT', '1st Year', '2026002', 'maria.santos@email.com', 'BSIT-1A', 'pass123', '09172222222', 'Quezon City', 'Pedro Santos', '09182222222', 'ACTIVE', 'STUDENT', '2026-09-21 21:52:50'),
(3, 'Pedro', 'Reyes', 'MALE', 'BSIT', '1st Year', '2026003', 'pedro.reyes@email.com', 'BSIT-1B', 'pass123', '09173333333', 'Makati', 'Ana Reyes', '09183333333', 'ACTIVE', 'STUDENT', '2026-09-21 21:52:50'),
(4, 'Ana', 'Bautista', 'MALE', 'BSIT', '2nd Year', '2026004', 'ana.bautista@email.com', 'BSIT-2A', 'pass123', '09174444444', 'Pasig', 'Luis Bautista', '09184444444', 'ACTIVE', 'STUDENT', '2026-09-21 21:52:50'),
(5, 'Jose', 'Rizal', 'MALE', 'BSIT', '2nd Year', '2026005', 'jose.rizal@email.com', 'BSIT-2A', 'pass123', '09175555555', 'Calamba', 'Teodora Rizal', '09185555555', 'ACTIVE', 'STUDENT', '2026-09-21 21:52:50'),
(11, 'Jamir', 'Bayrante', 'MALE', 'BSIT', '1st Year', '2026009', 'bayrante@gmail.com', 'BSIT-1A', 'tomboy123', '09123456789', 'Brgy. Inayawan', 'Macalua', '09123456789', 'ACTIVE', 'STUDENT', '2026-09-24 00:22:00'),
(15, 'Layos', 'Clark', 'MALE', 'BSIT', '3rd Year', '1234567', '1234567@gmail.com', 'BSIT-1B', '1234567', '091234567891', '12345678', '12345678', '1234567', 'ACTIVE', 'STUDENT', '2026-09-24 16:48:35');
