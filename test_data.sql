CREATE TABLE IF NOT EXISTS students (
    Id_number VARCHAR(20) PRIMARY KEY,
    First_name VARCHAR(100),
    Last_name VARCHAR(100),
    Email VARCHAR(150),
    Course VARCHAR(150),
    Year_level VARCHAR(50),
    Student_password VARCHAR(255),
    Role VARCHAR(20) DEFAULT 'STUDENT'
);
INSERT IGNORE INTO students (Id_number, First_name, Last_name, Email, Course, Year_level, Student_password, Role)
VALUES ('1234567', 'Kyle', 'Tester', 'kyle@test.com', 'BS Information Technology', '3rd Year', 'test1234', 'STUDENT');
