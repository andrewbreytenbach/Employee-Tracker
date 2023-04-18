const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const cTable = require('console.table');

// Create a connection pool to the employee_db database
const pool = mysql.createPool({
  connectionLimit: 10,
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
  const [rows, fields] = await pool.execute('SELECT * FROM department');
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
  const [rows, fields] = await pool.execute(query);
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
  const [rows, fields] = await pool.execute(query);
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
    
    try {
    const result = await connection.execute('INSERT INTO department (name) VALUES (?)', [answer.name]);
    console.log(`Added department: ${answer.name}`);
    } catch (err) {
    console.error(`Error adding department: ${err}`);
    }
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
  
    try {
      const result = await pool.execute('INSERT INTO department (name) VALUES (?)', [answer.name]);
      console.log(`Added department: ${answer.name}`);
    } catch (err) {
      console.error(`Error adding department: ${err}`);
    }
    console.log('----------------------------------------\n');
    await mainMenu();
  }
  

  async function addEmployee() {
    const roles = await pool.execute('SELECT id, title FROM role');
    const managers = await pool.execute('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
  
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "Enter the employee's first name:"
      },
      {
        type: 'input',
        name: 'lastName',
        message: "Enter the employee's last name:"
      },
      {
        type: 'list',
        name: 'roleId',
        message: "Select the employee's role:",
        choices: roles[0].map(role => ({ name: role.title, value: role.id }))
      },
      {
        type: 'list',
        name: 'managerId',
        message: "Select the employee's manager:",
        choices: [
          { name: 'None', value: null },
          ...managers[0].map(manager => ({ name: manager.name, value: manager.id }))
        ]
      }
    ]);
  
    try {
      const result = await pool.execute(
        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
        [answer.firstName, answer.lastName, answer.roleId, answer.managerId]
      );
      console.log(`Added employee: ${answer.firstName} ${answer.lastName}`);
    } catch (err) {
      console.error(`Error adding employee: ${err}`);
    }
  
    console.log('----------------------------------------\n');
    await mainMenu();
  }
  
  // Prompt the user to update an employee's role in the database
async function updateEmployeeRole() {
    const employeeChoices = await getEmployeeChoices();
    const roleChoices = await getRoleChoices();
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Which employee would you like to update?',
        choices: employeeChoices
      },
      {
        type: 'list',
        name: 'roleId',
        message: 'Which role would you like to assign to this employee?',
        choices: roleChoices
      }
    ]);
    try {
      const result = await pool.execute('UPDATE employee SET role_id = ? WHERE id = ?', [answer.roleId, answer.employeeId]);
      console.log(`Updated employee with ID ${answer.employeeId} to role with ID ${answer.roleId}`);
    } catch (err) {
      console.error(`Error updating employee role: ${err}`);
    }
    console.log('----------------------------------------\n');
    await mainMenu();
  }

  async function addRole() {
    const departments = await pool.execute('SELECT * FROM department');
    const departmentChoices = departments[0].map(department => {
      return { name: department.name, value: department.id };
    });
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the title of the new role:'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the salary of the new role:'
      },
      {
        type: 'list',
        name: 'department_id',
        message: 'Select the department for the new role:',
        choices: departmentChoices
      }
    ]);
    try {
      const result = await pool.execute('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [answer.title, answer.salary, answer.department_id]);
      console.log(`Added role: ${answer.title}`);
    } catch (err) {
      console.error(`Error adding role: ${err}`);
    }
    console.log('----------------------------------------\n');
    await mainMenu();
  }
  