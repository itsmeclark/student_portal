-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 22, 2026 at 08:29 PM
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
(10, 'bolhog', 'cardo', 'BSIT', '1st Year', '2026007', 'cardo@gmail.com', 'BSIT-1B', '123123', '09123456789', 'tondo', 'cardo bolhug', '09123123123', 'ACTIVE', '2026-09-22 23:54:15', 'STUDENT', 'MALE');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `STUDENTS`
--
ALTER TABLE `STUDENTS`
  ADD PRIMARY KEY (`Student_id`),
  ADD UNIQUE KEY `Id_number` (`Id_number`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `STUDENTS`
--
ALTER TABLE `STUDENTS`
  MODIFY `Student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
