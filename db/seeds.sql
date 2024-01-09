-- Use the employee_tracker database
USE employee_tracker;

-- Truncate data from the tables
DELETE FROM employees;
DELETE FROM roles;
DELETE FROM departments;

-- Insert data into the department table
INSERT INTO departments (name) VALUES ("Engineering"), ("Finance"), ("Legal"), ("Sales");

-- Insert data into the employee table
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
  ('Al', 'Amin', 1, NULL),
  ('Caven', 'Le', 2, 1),
  ('Dillon', 'Tran', 3, 1),
  ('Steven', 'Loung', 4, 1);

-- Insert data into the role table
INSERT INTO roles (title, salary, department_id) VALUES
  ('Software Engineer', 120000, 1),
  ('Sales Lead', 100000, 4),
  ('Accountant', 125000, 2),
  ('Lawyer', 190000, 3);
