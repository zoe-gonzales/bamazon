
// Node packages
var mysql = require('mysql');
var inquirer = require('inquirer');
const {table} = require('table');

// Constructors
var LogIn = require('./constructors/logIn');
var logIn = new LogIn(2, viewMenu);
var Validation = require('./constructors/validation');
var validation = new Validation();

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Queue72*8?',
    database: 'bamazon'
});

// connecting to bamazon db
connection.connect(function(error){
    if (error) console.log(error);
    // Prompting for username and password to access main menu
    logIn.logInUser();
});

// Main menu view
function viewMenu(){
    console.log('Welcome to Bamazon Supervisor View!');
    inquirer
    .prompt(
        {
            type: 'rawlist',
            message: 'Please select a menu item from the following:',
            choices: ['View Product Sales by Department', 'Create New Department', 'Logout'],
            name: 'action'
        }
    ).then(function(reply){
        switch (reply.action){
            case 'View Product Sales by Department':
                viewSales();
            break;
            case 'Create New Department':
                createDept();
            break;
            case 'Logout':
                console.log('Thanks for visiting! Come back again soon!');
                logIn.logOutUser();
                connection.end();
            break;
        }
    });
}

// Displays id, dept. name, overhead, total sales, and total profits for all departments
function viewSales(){
    // variables necessary for table package
    var data = [
        ['Dept. ID', 'Dept. Name', 'Overhead', 'Total Sales', 'Total Profit']
    ];
    var output;
    // select query for department_id, departments.department_name, over_head_costs, product_sales
    // inner join on dept. names for departments and products tables
    connection.query(
        'SELECT department_id, departments.department_name, over_head_costs, product_sales FROM departments INNER JOIN products ON departments.department_name = products.department_name',
        function(error, response){

            if (error) throw error;

            // checking if total profits can be calculated (if total sales exist)
            var totalProfit = function(costs, sales){
                var profits;
                if (costs && sales){
                    profits = sales - costs;
                    return profits;
                } else {
                    return 'No data';
                }
            }
            // looping throught response and pushing to data array
            for (var i=0; i < response.length; i++){
                var department = [];
                var deptID = response[i].department_id;
                var overHead = response[i].over_head_costs;
                var totalSales = response[i].product_sales;
                var profit = totalProfit(overHead, totalSales);
                var deptName = response[i].department_name;
                department.push(deptID, deptName, overHead, totalSales, profit);data.push(department);
            }

            // transform and display data
            output = table(data);
            console.log(output);

            // Return to main menu
            viewMenu();
        }
    );
}

// Creates new department based on user input
function createDept(){
    // prompting user for new dept. name and overhead cost
    inquirer
    .prompt([
        {
            name: 'departmentName',
            message: 'Department name:',
            // Validation requires that input is not null
            validate: input => validation.validStr(input)
        },
        {
            name: 'overhead',
            message: 'Department overhead costs:',
            // Validation requires that input is a number greater than 0
            validate: input => validation.validNum(input)
        }
    ]).then(function(reply){
        // query to insert new dept. data into bamazon db
        connection.query(
            'INSERT INTO departments SET ?',
            {
                department_name: reply.departmentName,
                over_head_costs: reply.overhead
            },
            function(error, response){
                if (error) throw error;

                // department successfully added
                console.log(`${response.affectedRows} department successfully added.`);
                
                // Return to main menu
                viewMenu();
            }
        );
    }); 
}