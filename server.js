const mysql = require("mysql2/promise");
const inquirer = require("inquirer");
require("console.table");

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

async function seedDatabase() {
    try {
      // Insert data into the departments table
      await pool.execute("INSERT INTO departments (name) VALUES (?)", ["Engineering"]);
      await pool.execute("INSERT INTO departments (name) VALUES (?)", ["Finance"]);
      await pool.execute("INSERT INTO departments (name) VALUES (?)", ["Legal"]);
      await pool.execute("INSERT INTO departments (name) VALUES (?)", ["Sales"]);
  
      // Insert data into the roles table
      await pool.execute("INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)", ['Software Engineer', 120000, 1]);
      await pool.execute("INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)", ['Sales Lead', 100000, 4]);
      await pool.execute("INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)", ['Accountant', 125000, 2]);
      await pool.execute("INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)", ['Lawyer', 190000, 3]);
  
      // Insert data into the employees table
      await pool.execute("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", ['Al', 'Amin', 1, NULL]);
      await pool.execute("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", ['Caven', 'Le', 2, 1]);
      await pool.execute("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", ['Dillon', 'Tran', 3, 1]);
      await pool.execute("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", ['Steven', 'Loung', 4, 1]);
  
      console.log("Seed data added successfully!");
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  }
  

async function startApp() {
  try {
    console.log(`
      
      
      
        
    `);

    await seedDatabase(); // Call the seed function

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
      const { action } = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: uniqueChoices
      });

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
        case "Add a department":
          await addDepartment();
          break;
        case "Add a role":
          await addRole();
          break;
        case "Add an employee":
          await addEmployee();
          break;
        case "Update an employee role":
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

// ... (the rest of your code)


  
  
async function viewAllDepartments() {
  const [rows] = await pool.execute("SELECT * FROM department");
  console.table(rows);
}

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

async function addDepartment() {
  const { departmentName } = await inquirer.prompt({
    type: "input",
    name: "departmentName",
    message: "Enter the name of the department:"
  });

  await pool.execute("INSERT INTO department (name) VALUES (?)", [departmentName]);

  console.log("Department added successfully!");
}

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

  await pool.execute(
    "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
    [roleDetails.roleTitle, roleDetails.roleSalary, roleDetails.departmentId]
  );

  console.log("Role added successfully!");
}

async function getRoleChoices() {
    const [roles] = await pool.execute("SELECT * FROM role");
    return roles.map(role => ({ name: role.title, value: role.id }));
  }
  
  async function getManagerChoices() {
    const [employees] = await pool.execute("SELECT * FROM employee");
    const choices = [{ name: "None", value: null }];
    choices.push(...employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id })));
    return choices;
  }
  
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
    
async function updateEmployeeRole() {
  const [employees, roles] = await Promise.all([
    pool.execute("SELECT * FROM employee"),
    pool.execute("SELECT * FROM role")
  ]);

  const employeeToUpdate = await inquirer.prompt({
    type: "list",
    name: "employeeId",
    message: "Select the employee to update:",
    choices: employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
  });

  const newRole = await inquirer.prompt({
    type: "list",
    name: "roleId",
    message: "Select the new role for the employee:",
    choices: roles.map(role => ({ name: role.title, value: role.id }))
  });

  await pool.execute("UPDATE employee SET role_id = ? WHERE id = ?", [newRole.roleId, employeeToUpdate.employeeId]);

  console.log("Employee role updated successfully!");
}

// Start the application
startApp();
