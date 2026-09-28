-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 28, 2026 at 06:02 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student_portal`
--

-- --------------------------------------------------------

--
-- Table structure for table `ADMIN`
--

CREATE TABLE `ADMIN` (
  `Admin_id` int(11) NOT NULL,
  `Admin_name` varchar(50) NOT NULL,
  `Admin_password` varchar(255) NOT NULL,
  `Role` enum('ADMIN') NOT NULL DEFAULT 'ADMIN'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ADMIN`
--

INSERT INTO `ADMIN` (`Admin_id`, `Admin_name`, `Admin_password`, `Role`) VALUES
(1, 'admin', 'admin123', 'ADMIN');

-- --------------------------------------------------------

--
-- Table structure for table `ANNOUNCEMENTS`
--

CREATE TABLE `ANNOUNCEMENTS` (
  `Announcement_id` int(11) NOT NULL,
  `Admin_id` int(11) NOT NULL,
  `Announcement_title` varchar(100) NOT NULL,
  `Announcement_summary` varchar(100) NOT NULL,
  `Announcement_description` varchar(255) NOT NULL,
  `Announcement_category` varchar(100) NOT NULL,
  `Announcement_publishby` varchar(100) NOT NULL,
  `Announcement_date` datetime DEFAULT current_timestamp(),
  `Announcement_status` enum('Cancelled','Published','Expired') NOT NULL DEFAULT 'Published'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ANNOUNCEMENTS`
--

INSERT INTO `ANNOUNCEMENTS` (`Announcement_id`, `Admin_id`, `Announcement_title`, `Announcement_summary`, `Announcement_description`, `Announcement_category`, `Announcement_publishby`, `Announcement_date`, `Announcement_status`) VALUES
(1, 1, 'Enrollment Open for 2nd Semester', 'Enrollment for 2nd Semester AY 2025-2026 is now open.', 'All students are required to enroll on or before November 15, 2025. Please visit the registrar office or use the online portal.', 'Enrollment', 'Registrar', '2026-09-21 21:58:32', 'Published'),
(2, 1, 'Final Exam Schedule Released', 'Final exams will start on December 10, 2025.', 'Please check the official exam schedule posted on the school bulletin boards and portal. Bring your school ID at all times.', 'Examination', 'Academic Affairs', '2026-09-21 21:58:32', 'Published');

-- --------------------------------------------------------

--
-- Table structure for table `ENROLLMENTS`
--

CREATE TABLE `ENROLLMENTS` (
  `Enrollment_id` int(11) NOT NULL,
  `Student_id` int(11) NOT NULL,
  `Section_id` int(11) NOT NULL,
  `Academic_year` varchar(100) NOT NULL,
  `Semester` varchar(20) NOT NULL,
  `Year_level` varchar(20) NOT NULL,
  `Enrollment_type` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ENROLLMENTS`
--

INSERT INTO `ENROLLMENTS` (`Enrollment_id`, `Student_id`, `Section_id`, `Academic_year`, `Semester`, `Year_level`, `Enrollment_type`) VALUES
(1, 1, 1, '2025-2026', '1st Semester', '1st Year', 'REGULAR'),
(2, 2, 1, '2025-2026', '1st Semester', '1st Year', 'REGULAR'),
(3, 3, 2, '2025-2026', '1st Semester', '1st Year', 'REGULAR'),
(4, 4, 3, '2025-2026', '1st Semester', '2nd Year', 'REGULAR'),
(5, 5, 3, '2025-2026', '1st Semester', '2nd Year', 'IRREGULAR'),
(9, 11, 1, '2025-2026', '1st Semester', '1st Year', 'IRREGULAR'),
(12, 15, 2, '2025-2026', '1st Semester', '3rd Year', 'REGULAR');

-- --------------------------------------------------------

--
-- Table structure for table `ENROLLMENT_SUBJECTS`
--

CREATE TABLE `ENROLLMENT_SUBJECTS` (
  `Enrollments_subject_id` int(11) NOT NULL,
  `Enrollment_id` int(11) NOT NULL,
  `Subject_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ENROLLMENT_SUBJECTS`
--

INSERT INTO `ENROLLMENT_SUBJECTS` (`Enrollments_subject_id`, `Enrollment_id`, `Subject_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 2, 1),
(5, 2, 2),
(6, 2, 3),
(7, 3, 1),
(8, 3, 2),
(9, 3, 3),
(10, 4, 3),
(11, 4, 4),
(12, 4, 5),
(13, 5, 3),
(14, 5, 4),
(15, 5, 5),
(16, 9, 1),
(17, 9, 2),
(18, 9, 3),
(19, 12, 1),
(20, 12, 2),
(21, 12, 3);

-- --------------------------------------------------------

--
-- Table structure for table `GRADES`
--

CREATE TABLE `GRADES` (
  `Grade_id` int(11) NOT NULL,
  `Enrollments_subject_id` int(11) NOT NULL,
  `Prelim` decimal(3,2) DEFAULT NULL,
  `Midterm` decimal(3,2) DEFAULT NULL,
  `Semifinal` decimal(3,2) DEFAULT NULL,
  `Final` decimal(3,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `GRADES`
--

INSERT INTO `GRADES` (`Grade_id`, `Enrollments_subject_id`, `Prelim`, `Midterm`, `Semifinal`, `Final`) VALUES
(1, 1, 1.50, 1.75, 1.50, 1.50),
(2, 2, 2.00, 1.75, 2.00, 1.75),
(3, 3, 1.75, 2.00, 1.75, 1.75),
(4, 4, 1.25, 1.50, 1.25, 1.25),
(5, 5, 1.75, 1.50, 1.75, 1.50),
(6, 6, 2.00, 2.25, 1.75, 2.00),
(7, 7, 2.50, 2.25, 2.50, 2.50),
(8, 8, 2.75, 2.50, 2.75, 2.50),
(9, 9, 3.00, 2.75, 2.50, 2.75),
(10, 10, 1.50, 1.25, 1.50, 1.25),
(11, 11, 1.75, 1.50, 1.75, 1.50),
(12, 12, 2.00, 1.75, 1.75, 1.75),
(13, 13, 2.25, 2.00, 2.25, 2.00),
(14, 14, 2.50, 2.25, 2.50, 2.25),
(15, 15, 2.75, 2.50, 2.75, 2.50);

-- --------------------------------------------------------

--
-- Table structure for table `SECTIONS`
--

CREATE TABLE `SECTIONS` (
  `Section_id` int(11) NOT NULL,
  `Section_num` int(11) DEFAULT NULL,
  `Section_program` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `SECTIONS`
--

INSERT INTO `SECTIONS` (`Section_id`, `Section_num`, `Section_program`) VALUES
(1, 1, 'BSIT-1A'),
(2, 2, 'BSIT-1B'),
(3, 3, 'BSIT-2A');

-- --------------------------------------------------------

--
-- Table structure for table `STUDENTS`
--

CREATE TABLE `STUDENTS` (
  `Student_id` int(11) NOT NULL,
  `First_name` varchar(100) NOT NULL,
  `Last_name` varchar(100) NOT NULL,
  `Course` varchar(100) NOT NULL,
  `Current_year_level` varchar(20) NOT NULL,
  `Id_number` varchar(50) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Current_section_num` varchar(20) NOT NULL,
  `Student_password` varchar(255) NOT NULL,
  `Contact_num` varchar(20) NOT NULL,
  `Current_address` varchar(255) NOT NULL,
  `Emergency_contact_name` varchar(150) NOT NULL,
  `Emergency_contact_num` varchar(20) NOT NULL,
  `Status` enum('ACTIVE','INACTIVE','DROPOUT') NOT NULL DEFAULT 'ACTIVE',
  `Created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `Role` enum('STUDENT') NOT NULL DEFAULT 'STUDENT',
  `Gender` enum('MALE','FEMALE') NOT NULL DEFAULT 'MALE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `STUDENTS`
--

INSERT INTO `STUDENTS` (`Student_id`, `First_name`, `Last_name`, `Course`, `Current_year_level`, `Id_number`, `Email`, `Current_section_num`, `Student_password`, `Contact_num`, `Current_address`, `Emergency_contact_name`, `Emergency_contact_num`, `Status`, `Created_at`, `Role`, `Gender`) VALUES
(1, 'Juan', 'Dela Cruz', 'BSIT', '1st Year', '2026001', 'juan.delacruz@email.com', 'BSIT-1A', 'pass123', '09171111111', 'Manila', 'Maria Dela Cruz', '09181111111', 'ACTIVE', '2026-09-21 21:52:50', 'STUDENT', 'MALE'),
(2, 'Maria', 'Santos', 'BSIT', '1st Year', '2026002', 'maria.santos@email.com', 'BSIT-1A', 'pass123', '09172222222', 'Quezon City', 'Pedro Santos', '09182222222', 'ACTIVE', '2026-09-21 21:52:50', 'STUDENT', 'MALE'),
(3, 'Pedro', 'Reyes', 'BSIT', '1st Year', '2026003', 'pedro.reyes@email.com', 'BSIT-1B', 'pass123', '09173333333', 'Makati', 'Ana Reyes', '09183333333', 'ACTIVE', '2026-09-21 21:52:50', 'STUDENT', 'MALE'),
(4, 'Ana', 'Bautista', 'BSIT', '2nd Year', '2026004', 'ana.bautista@email.com', 'BSIT-2A', 'pass123', '09174444444', 'Pasig', 'Luis Bautista', '09184444444', 'ACTIVE', '2026-09-21 21:52:50', 'STUDENT', 'MALE'),
(5, 'Jose', 'Rizal', 'BSIT', '2nd Year', '2026005', 'jose.rizal@email.com', 'BSIT-2A', 'pass123', '09175555555', 'Calamba', 'Teodora Rizal', '09185555555', 'ACTIVE', '2026-09-21 21:52:50', 'STUDENT', 'MALE'),
(11, 'Jamir', 'Bayrante', 'BSIT', '1st Year', '2026009', 'bayrante@gmail.com', 'BSIT-1A', 'tomboy123', '09123456789', 'Brgy. Inayawan', 'Macalua', '09123456789', 'ACTIVE', '2026-09-24 00:22:00', 'STUDENT', 'MALE'),
(15, 'Layos', 'Clark', 'BSIT', '3rd Year', '1234567', '1234567@gmail.com', 'BSIT-1B', '1234567', '091234567891', '12345678', '12345678', '1234567', 'ACTIVE', '2026-09-24 16:48:35', 'STUDENT', 'MALE');

-- --------------------------------------------------------

--
-- Table structure for table `SUBJECTS`
--

CREATE TABLE `SUBJECTS` (
  `Subject_id` int(11) NOT NULL,
  `Subject_code` varchar(50) NOT NULL,
  `Edp_code` varchar(50) NOT NULL,
  `Subject_name` varchar(50) NOT NULL,
  `Instructor_name` varchar(50) NOT NULL,
  `Room` varchar(50) NOT NULL,
  `Schedule_days` varchar(50) NOT NULL,
  `Start_time` varchar(50) NOT NULL,
  `End_time` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `SUBJECTS`
--

INSERT INTO `SUBJECTS` (`Subject_id`, `Subject_code`, `Edp_code`, `Subject_name`, `Instructor_name`, `Room`, `Schedule_days`, `Start_time`, `End_time`) VALUES
(1, 'IT101', 'EDP001', 'Intro to Computing', 'Prof. Cruz', 'Room 201', 'MWF', '08:00', '09:00'),
(2, 'IT102', 'EDP002', 'Computer Programming 1', 'Prof. Garcia', 'Room 202', 'MWF', '09:00', '10:00'),
(3, 'IT103', 'EDP003', 'Discrete Mathematics', 'Prof. Lopez', 'Room 203', 'TTH', '10:00', '11:30'),
(4, 'IT201', 'EDP004', 'Data Structures', 'Prof. Mendoza', 'Room 301', 'MWF', '13:00', '14:00'),
(5, 'IT202', 'EDP005', 'Object-Oriented Programming', 'Prof. Tan', 'Room 302', 'TTH', '14:00', '15:30'),
(6, 'GE101', 'EDP006', 'Understanding the Self', 'Prof. Ramos', 'Room 401', 'SAT', '08:00', '11:00');

-- --------------------------------------------------------

--
-- Table structure for table `TUITION`
--

CREATE TABLE `TUITION` (
  `Tuition_id` int(11) NOT NULL,
  `Enrollment_id` int(11) DEFAULT NULL,
  `Laboratory` decimal(10,2) NOT NULL,
  `Tuition_Fee` decimal(10,2) DEFAULT NULL,
  `Miscellaneous_fee` decimal(10,2) NOT NULL,
  `Infra` decimal(10,2) NOT NULL,
  `Atalaya` decimal(10,2) NOT NULL,
  `Ssg` decimal(10,2) NOT NULL,
  `Insurance` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `TUITION`
--

INSERT INTO `TUITION` (`Tuition_id`, `Enrollment_id`, `Laboratory`, `Tuition_Fee`, `Miscellaneous_fee`, `Infra`, `Atalaya`, `Ssg`, `Insurance`) VALUES
(1, 1, 1500.00, 12000.00, 500.00, 300.00, 200.00, 150.00, 100.00),
(2, 2, 1500.00, 12000.00, 500.00, 300.00, 200.00, 150.00, 100.00),
(3, 3, 1500.00, 12000.00, 500.00, 300.00, 200.00, 150.00, 100.00),
(4, 4, 2000.00, 15000.00, 600.00, 350.00, 250.00, 150.00, 100.00),
(5, 5, 2000.00, 15000.00, 600.00, 350.00, 250.00, 150.00, 100.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ADMIN`
--
ALTER TABLE `ADMIN`
  ADD PRIMARY KEY (`Admin_id`);

--
-- Indexes for table `ANNOUNCEMENTS`
--
ALTER TABLE `ANNOUNCEMENTS`
  ADD PRIMARY KEY (`Announcement_id`),
  ADD KEY `Admin_id` (`Admin_id`);

--
-- Indexes for table `ENROLLMENTS`
--
ALTER TABLE `ENROLLMENTS`
  ADD PRIMARY KEY (`Enrollment_id`),
  ADD UNIQUE KEY `Student_id` (`Student_id`,`Section_id`,`Academic_year`,`Semester`),
  ADD KEY `Section_id` (`Section_id`);

--
-- Indexes for table `ENROLLMENT_SUBJECTS`
--
ALTER TABLE `ENROLLMENT_SUBJECTS`
  ADD PRIMARY KEY (`Enrollments_subject_id`),
  ADD KEY `Enrollment_id` (`Enrollment_id`),
  ADD KEY `Subject_id` (`Subject_id`);

--
-- Indexes for table `GRADES`
--
ALTER TABLE `GRADES`
  ADD PRIMARY KEY (`Grade_id`),
  ADD UNIQUE KEY `Enrollments_subject_id` (`Enrollments_subject_id`);

--
-- Indexes for table `SECTIONS`
--
ALTER TABLE `SECTIONS`
  ADD PRIMARY KEY (`Section_id`);

--
-- Indexes for table `STUDENTS`
--
ALTER TABLE `STUDENTS`
  ADD PRIMARY KEY (`Student_id`),
  ADD UNIQUE KEY `Id_number` (`Id_number`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indexes for table `SUBJECTS`
--
ALTER TABLE `SUBJECTS`
  ADD PRIMARY KEY (`Subject_id`);

--
-- Indexes for table `TUITION`
--
ALTER TABLE `TUITION`
  ADD PRIMARY KEY (`Tuition_id`),
  ADD KEY `Enrollment_id` (`Enrollment_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ADMIN`
--
ALTER TABLE `ADMIN`
  MODIFY `Admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ANNOUNCEMENTS`
--
ALTER TABLE `ANNOUNCEMENTS`
  MODIFY `Announcement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `ENROLLMENTS`
--
ALTER TABLE `ENROLLMENTS`
  MODIFY `Enrollment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `ENROLLMENT_SUBJECTS`
--
ALTER TABLE `ENROLLMENT_SUBJECTS`
  MODIFY `Enrollments_subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `GRADES`
--
ALTER TABLE `GRADES`
  MODIFY `Grade_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `SECTIONS`
--
ALTER TABLE `SECTIONS`
  MODIFY `Section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `STUDENTS`
--
ALTER TABLE `STUDENTS`
  MODIFY `Student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `SUBJECTS`
--
ALTER TABLE `SUBJECTS`
  MODIFY `Subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `TUITION`
--
ALTER TABLE `TUITION`
  MODIFY `Tuition_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ANNOUNCEMENTS`
--
ALTER TABLE `ANNOUNCEMENTS`
  ADD CONSTRAINT `ANNOUNCEMENTS_ibfk_1` FOREIGN KEY (`Admin_id`) REFERENCES `ADMIN` (`Admin_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ENROLLMENTS`
--
ALTER TABLE `ENROLLMENTS`
  ADD CONSTRAINT `ENROLLMENTS_ibfk_1` FOREIGN KEY (`Student_id`) REFERENCES `STUDENTS` (`Student_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ENROLLMENTS_ibfk_2` FOREIGN KEY (`Section_id`) REFERENCES `SECTIONS` (`Section_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ENROLLMENT_SUBJECTS`
--
ALTER TABLE `ENROLLMENT_SUBJECTS`
  ADD CONSTRAINT `ENROLLMENT_SUBJECTS_ibfk_1` FOREIGN KEY (`Enrollment_id`) REFERENCES `ENROLLMENTS` (`Enrollment_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ENROLLMENT_SUBJECTS_ibfk_2` FOREIGN KEY (`Subject_id`) REFERENCES `SUBJECTS` (`Subject_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `GRADES`
--
ALTER TABLE `GRADES`
  ADD CONSTRAINT `GRADES_ibfk_1` FOREIGN KEY (`Enrollments_subject_id`) REFERENCES `ENROLLMENT_SUBJECTS` (`Enrollments_subject_id`) ON DELETE CASCADE;

--
-- Constraints for table `TUITION`
--
ALTER TABLE `TUITION`
  ADD CONSTRAINT `TUITION_ibfk_1` FOREIGN KEY (`Enrollment_id`) REFERENCES `ENROLLMENTS` (`Enrollment_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
