const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const cTable = require('console.table');

// Create a connection to the employee_db database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'maverick',
  database: 'employee_db'
});

// Initialize the application
async function init() {
  console.log('Welcome to the Employee Management System');
  console.log('----------------------------------------');

  // Display the main menu
  await mainMenu();
}

init();

// Display the main menu with options to view, add, or update data
async function mainMenu() {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
      ]
    }
  ]);

  switch (answer.choice) {
    case 'View all departments':
      await viewDepartments();
      break;
    case 'View all roles':
      await viewRoles();
      break;
    case 'View all employees':
      await viewEmployees();
      break;
    case 'Add a department':
      await addDepartment();
      break;
    case 'Add a role':
      await addRole();
      break;
    case 'Add an employee':
      await addEmployee();
      break;
    case 'Update an employee role':
      await updateEmployeeRole();
      break;
    case 'Exit':
      console.log('Goodbye!');
      process.exit();
    default:
      console.log(`Invalid choice: ${answer.choice}`);
      break;
  }
}

// Query the database to view all departments
async function viewDepartments() {
  const [rows, fields] = await connection.execute('SELECT * FROM department');
  console.log('\n');
  console.table(rows);
  console.log('----------------------------------------\n');
  await mainMenu();
}

// Query the database to view all roles
async function viewRoles() {
  const query = `
    SELECT r.id, r.title, r.salary, d.name AS department
    FROM role r
    INNER JOIN department d ON r.department_id = d.id
  `;
  const [rows, fields] = await connection.execute(query);
  console.log('\n');
  console.table(rows);
  console.log('----------------------------------------\n');
  await mainMenu();
}

// Query the database to view all employees
async function viewEmployees() {
  const query = `
    SELECT e.id, e.first_name, e.last_name, r.title AS role, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    INNER JOIN role r ON e.role_id = r.id
    INNER JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id
  `;
  const [rows, fields] = await connection.execute(query);
  console.log('\n');
  console.table(rows);
  console.log('----------------------------------------\n');
  await mainMenu();
}

// Prompt the user to add a new department to the database
async function addDepartment() {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name of the new department:'
    }
  ]);

    await connection.execute('INSERT INTO department (name) VALUES (?)', [answer.name]);
    console.log(`Added department: ${answer.name}`);
    console.log('----------------------------------------\n');
    await mainMenu();
  }
  
  // Prompt the user to add a new role to the database
async function addRole() {
    // Get a list of departments from the database
    const [departments, fields] = await connection.execute('SELECT * FROM department');
    const departmentChoices = departments.map(department => ({
      name: department.name,
      value: department.id
    }));
  
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the title of the new role:'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the salary for the new role:'
      },
      {
        type: 'list',
        name: 'department_id',
        message: 'Select the department for the new role:',
        choices: departmentChoices
      }
    ]);
  
    await connection.execute('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [
      answers.title,
      answers.salary,
      answers.department_id
    ]);
    console.log(`Added role: ${answers.title}`);
    console.log('----------------------------------------\n');
    await mainMenu();
  }
  

  // Prompt the user to add a new employee to the database
async function addEmployee() {
    // Get a list of roles and employees from the database
    const [roles, fields1] = await connection.execute('SELECT * FROM role');
    const [employees, fields2] = await connection.execute('SELECT * FROM employee');
    const roleChoices = roles.map(role => ({
      name: role.title,
      value: role.id
    }));
    const employeeChoices = employees.map(employee => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id
    }));
  
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'first_name',
        message: "Enter the employee's first name:"
      },
      {
        type: 'input',
        name: 'last_name',
        message: "Enter the employee's last name:"
      },
      {
        type: 'list',
        name: 'role_id',
        message: "Select the employee's role:",
        choices: roleChoices
      },
      {
        type: 'list',
        name: 'manager_id',
        message: "Select the employee's manager:",
        choices: [
          { name: 'None', value: null },
          ...employeeChoices
        ]
      }
    ]);
  
    await connection.execute('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [
      answers.first_name,
      answers.last_name,
      answers.role_id,
      answers.manager_id
    ]);
    console.log(`Added employee: ${answers.first_name} ${answers.last_name}`);
    console.log('----------------------------------------\n');
    await mainMenu();
  }
  

  // Prompt the user to update an employee's role
async function updateEmployeeRole() {
    // Get a list of employees and roles from the database
    const [employees, fields1] = await connection.execute('SELECT * FROM employee');
    const [roles, fields2] = await connection.execute('SELECT * FROM role');
    const employeeChoices = employees.map(employee => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id
    }));
    const roleChoices = roles.map(role => ({
      name: role.title,
      value: role.id
    }));
  
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'employee_id',
        message: "Select the employee whose role you'd like to update:",
        choices: employeeChoices
      },
      {
        type: 'list',
        name: 'role_id',
        message: "Select the employee's new role:",
        choices: roleChoices
      }
    ]);
  
    await connection.execute('UPDATE employee SET role_id = ? WHERE id = ?', [
      answers.role_id,
      answers.employee_id
    ]);
    console.log(`Updated employee role.`);
    console.log('----------------------------------------\n');
    await mainMenu();
  }
  