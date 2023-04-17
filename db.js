// imports the necessary modules for the application
const mysql = require('mysql2');

// create the connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'yourpassword',
  database: 'employee_db'
});

// connect to the database
connection.connect(function(err) {
  if (err) throw err;
  console.log('Connected to the database.');
});

module.exports = connection;
