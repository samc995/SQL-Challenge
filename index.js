const inquirer = require('inquirer')
const db = require('./db/connection')
require('console.table')

const utils = require('util')
const { start } = require('repl')
const { title } = require('process')
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
  inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "what is the name of the new department?"
        }
    ]).then(res => {
      var name = res;
      db.query("INSERT INTO department SET ?", name)
      .then(() => console.log(`Added ${name.name} to the database`))
      .then(() => startApp())
    })
}

async function addRole() {
  db.query("Select * from department").then((rows) => {
    console.log(rows)
const choices = rows.map (({id , name })=> {
  return {
    name: name,
    value: id
  }
})
inquirer.prompt([
  {
      type: "input",
      name: "title",
      message: "what is the name of the new role?"
  },
  {
    type: "input",
    name: "salary",
    message: "what is the salary of the new role?"
},
{
  type: "list",
  name: "department_id",
  message: "what is the department ID of the new role?",
  choices: choices
}
]).then(role => {
  console.log (role)
db.query(`INSERT INTO role (title, salary, department_id) values('${role.title}', ${role.salary}, ${role.department_id})`)
.then(() => console.log(`Added new role to the database`))
.then(() => startApp())
})
  })
}

  async function addEmployee() {
    const data = await db.query("Select * from employee")
    const employees = data.map (({first_name, last_name, id})=> {
      return {
        name: `${first_name} ${last_name} `,
        value: id
      }
    })
    db.query("Select * from role").then((rows) => {
  const choices = rows.map (({id , title })=> {
    return {
      name: title,
      value: id
    }
  })
  
  // db.query("Select * from employee").then((employees) => {

  // })
  inquirer.prompt([
    {
        type: "input",
        name: "first_name",
        message: "what is the first name of the new employee?"
    },
    {
      type: "input",
      name: "last_name",
      message: "what is the last name of the new employee?"
  },
  {
    type: "list",
    name: "role_id",
    message: "what is the role ID of the new employee?",
    choices: choices
  },
  {
    type: "list",
    name: "manager_id",
    message: "what is the manager ID of the new employee?",
    choices: employees
  }
  ]).then(employee => {
  db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) values('${employee.first_name}', '${employee.last_name}', ${employee.role_id}, ${employee.manager_id})`)
  .then(() => console.log(`Added new employee to the database`))
  .then(() => startApp())
  })
    })
  }


startApp()