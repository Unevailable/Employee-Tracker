-- Use the employee_tracker database
USE employee_tracker;

-- Truncate data from the tables
DELETE FROM employee;
DELETE FROM role;
DELETE FROM department;

-- Insert data into the department table
INSERT INTO department (name) VALUES ("Engineering"), ("Finance"), ("Legal"), ("Sales");

-- Insert data into the role table
INSERT INTO role (title, salary, department_id) VALUES
  ('Software Engineer', 120000, 1),   -- Assumes Engineering is id 1
  ('Sales Lead', 100000, 4),          -- Assumes Sales is id 4
  ('Accountant', 125000, 2),          -- Assumes Finance is id 2
  ('Lawyer', 190000, 3);              -- Assumes Legal is id 3

-- Insert data into the employee table
-- Assuming role IDs are assigned in the same order as role records are inserted
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ('Al', 'Amin', 1, NULL),            -- Assumes Software Engineer role is id 1
  ('Caven', 'Le', 2, 1),              -- Assumes Sales Lead role is id 2
  ('Dillon', 'Tran', 3, 1),           -- Assumes Accountant role is id 3
  ('Steven', 'Loung', 4, 1);          -- Assumes Lawyer role is id 4