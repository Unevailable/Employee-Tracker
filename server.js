// Import required libraries
const mysql = require("mysql2/promise");
const inquirer = require("inquirer");
require("console.table");

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "rootroot",
  database: "employee_tracker",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to seed the database with sample data
async function seedDatabase() {
  try {
    // Insert data into the departments table
    await pool.execute("INSERT INTO department (name) VALUES (?)", ["Engineering"]);
    await pool.execute("INSERT INTO department (name) VALUES (?)", ["Finance"]);
    await pool.execute("INSERT INTO department (name) VALUES (?)", ["Legal"]);
    await pool.execute("INSERT INTO department (name) VALUES (?)", ["Sales"]);

    // Insert data into the roles table
    await pool.execute("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", ['Software Engineer', 120000, 1]);
    await pool.execute("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", ['Sales Lead', 100000, 4]);
    await pool.execute("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", ['Accountant', 125000, 2]);
    await pool.execute("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", ['Lawyer', 190000, 3]);

    // Insert data into the employees table
    await pool.execute("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", ['Al', 'Amin', 1, null]);
    await pool.execute("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", ['Caven', 'Le', 2, 1]);
    await pool.execute("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", ['Dillon', 'Tran', 3, 1]);
    await pool.execute("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", ['Steven', 'Loung', 4, 1]);

    console.log("Seed data added successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

// Function to start the application
async function startApp() {
  try {
    console.log(`Employee Tracker`);

    const uniqueChoices = [
      "View all employees",
      "Add an employee",
      "Update employee role",
      "View all roles",
      "Add role",
      "View all departments",
      "Add department",
      "Quit"
    ];

    while (true) {
      // Prompt the user to choose an action
      const { action } = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: uniqueChoices
      });

      // Switch case to handle user's chosen action
      switch (action) {
        case "View all departments":
          await viewAllDepartments();
          break;
        case "View all roles":
          await viewAllRoles();
          break;
        case "View all employees":
          await viewAllEmployees();
          break;
        case "Add department":
          await addDepartment();
          break;
        case "Add role":
          await addRole();
          break;
        case "Add an employee":
          await addEmployee();
          break;
        case "Update employee role":
          await updateEmployeeRole();
          break;
        case "Quit":
          console.log("Goodbye!");
          await pool.end();
          process.exit();
      }
    }
  } catch (error) {
    console.error("Error connecting to MySQL:", error);
    process.exit(1);
  }
}

// Function to view all departments
async function viewAllDepartments() {
  const [rows] = await pool.execute("SELECT * FROM department");
  console.table(rows);
}

// Function to view all roles
async function viewAllRoles() {
  const [rows] = await pool.execute(`
    SELECT role.title, role.salary, department.name AS department
    FROM role
    JOIN department ON role.department_id = department.id
  `);
  if (rows.length > 0) {
    console.table(rows);
  } else {
    console.log("No roles found.");
  }
}

// Function to view all employees
async function viewAllEmployees() {
  const [rows] = await pool.execute(`
    SELECT employee.id, employee.first_name, employee.last_name, 
           role.title AS role, role.salary, 
           managers.first_name AS manager_first_name, managers.last_name AS manager_last_name
    FROM employee
    JOIN role ON employee.role_id = role.id
    LEFT JOIN employee managers ON employee.manager_id = managers.id
  `);
  console.table(rows);
}

// Function to add a department
async function addDepartment() {
  const { departmentName } = await inquirer.prompt({
    type: "input",
    name: "departmentName",
    message: "Enter the name of the department:"
  });

  await pool.execute("INSERT INTO department (name) VALUES (?)", [departmentName]);

  console.log("Department added successfully!");
}

// Function to add a role
async function addRole() {
  const [departments] = await pool.execute("SELECT * FROM department");

  const roleDetails = await inquirer.prompt([
    {
      type: "input",
      name: "roleTitle",
      message: "Enter the title of the role:"
    },
    {
      type: "input",
      name: "roleSalary",
      message: "Enter the salary for the role:"
    },
    {
      type: "list",
      name: "departmentId",
      message: "Select the department for the role:",
      choices: departments.map(department => ({ name: department.name, value: department.id }))
    }
  ]);

  const sql = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";

  try {
    await pool.execute(sql, [roleDetails.roleTitle, roleDetails.roleSalary, roleDetails.departmentId]);
    console.log("Role added successfully!");
  } catch (error) {
    console.error("Error adding role:", error);
  }
}

// Function to get role choices
async function getRoleChoices() {
  const [roles] = await pool.execute("SELECT * FROM role");
  return roles.map(role => ({ name: role.title, value: role.id }));
}

// Function to get manager choices
async function getManagerChoices() {
  const [employees] = await pool.execute("SELECT * FROM employee");
  const choices = [{ name: "None", value: null }];
  choices.push(...employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id })));
  return choices;
}

// Function to add an employee
async function addEmployee() {
  const [roles, employees] = await Promise.all([
    getRoleChoices(),
    getManagerChoices()
  ]);

  const employeeDetails = await inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "Enter the employee's first name:"
    },
    {
      type: "input",
      name: "lastName",
      message: "Enter the employee's last name:"
    },
    {
      type: "list",
      name: "roleId",
      message: "Select the employee's role:",
      choices: roles
    },
    {
      type: "list",
      name: "managerId",
      message: "Select the employee's manager:",
      choices: employees
    }
  ]);

  await pool.execute(
    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
    [employeeDetails.firstName, employeeDetails.lastName, employeeDetails.roleId, employeeDetails.managerId]
  );

  console.log("Employee added successfully!");
}

// Function to update an employee's role
async function updateEmployeeRole() {
  try {
    const [employees, roles] = await Promise.all([
      pool.execute("SELECT * FROM employee"),
      pool.execute("SELECT * FROM role")
    ]);

    const employeeToUpdate = await inquirer.prompt({
      type: "list",
      name: "employeeId",
      message: "Select the employee to update:",
      choices: employees[0].map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
    });

    console.log("Selected employee to update:", employeeToUpdate);

    const newRole = await inquirer.prompt({
      type: "list",
      name: "roleId",
      message: "Select the new role for the employee:",
      choices: roles[0].map(role => ({ name: role.title, value: role.id }))
    });

    console.log("Selected new role:", newRole);

    await pool.execute("UPDATE employee SET role_id = ? WHERE id = ?", [newRole.roleId, employeeToUpdate.employeeId]);

    console.log("Employee role updated successfully!");
  } catch (error) {
    console.error("Error updating employee role:", error);
  }
}

// Start the application
startApp();
