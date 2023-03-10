const inquirer = require('inquirer')
const db = require('./db/connection')
require('console.table')

const utils = require('util')
const { start } = require('repl')
db.query = utils.promisify(db.query)

async function startApp() {
    const answer=await inquirer
      .prompt([
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
            'Quit',
          ],
        },
      ]) 
      switch (answer.choice) {
        case 'View all departments':
          viewDepts()
          break

        case 'View all roles':
          viewRoles()
          break

        case 'View all employees':
          viewEmployees()
          break

        case 'Add a department':
          addDepartment()
          break

        case 'Add a role':
          addRole()
          break

        case 'Add an employee':
          addEmployee()
          break

        case 'Update an employee role':
          updateEmployee()
          break

        case "Quit":
           db.close()
       
         
      }
}

async function viewDepts(){
    const result=await db.query("select * from department")
    console.table(result)
    startApp()
}

async function  viewRoles(){
    const result = await db.query("select role.id, role.title, role.salary, department.name from role left join department on department.id = role.department_id")
    console.table(result)
    startApp()
}
async function  viewEmployees(){
const sql = `SELECT employee.id, employee.first_name AS "first name", employee.last_name 
                    AS "last name", role.title, department.name AS department, role.salary, 
                    concat(manager.first_name, " ", manager.last_name) AS manager
                    FROM employee
                    LEFT JOIN role
                    ON employee.role_id = role.id
                    LEFT JOIN department
                    ON role.department_id = department.id
                    LEFT JOIN employee manager
                    ON manager.id = employee.manager_id`
const result = await db.query(sql)
console.table(result)
startApp()
}

async function addDepartment() {
    const answer = await inquirer.prompt([
        {
            type: "input",
            name: "department",
            message: "what is the name of the new department?"
        }
    ])
    const result = await db.query("insert into department (name) values=(?)" , [answer.department])
    console.log("your department was added!")
    startApp()
}




startApp()