
var mysql = require('mysql');
var inquirer = require('inquirer');
const {table} = require('table');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Queue72*8?',
    database: 'bamazon'
});

// connecting to bamazon db
connection.connect(function(error){
    if (error) console.log(error);
    // console.log('connected as id ' + connection.threadId);
    logIn();
});

function logIn(){
    inquirer
    .prompt([
        {
            name: 'user',
            message: 'Enter username:'
        },
        {
            type: 'password',
            name: 'pass',
            message: 'Enter password:'
        }
    ]).then(function(reply){
        if (reply.user === 'supervisor' && reply.pass === 'hola'){
            viewMenu();
        } else {
            console.log('Incorrect credentials. Please try again.');
            logIn();
        }
    });
}

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
                connection.end();
            break;
        }

    });
}

function viewSales(){
    // variables necessary for table package
    var data = [
        ['Dept. ID', 'Dept. Name', 'Overhead', 'Total Sales', 'Total Profit']
    ];
    var output;
    // select query for department_id, departments.department_name, over_head_costs, product_sales
    // left join on dept. ana product ids
    connection.query(
        'SELECT department_id, departments.department_name, over_head_costs, product_sales FROM departments LEFT JOIN products ON departments.department_id = products.item_id',
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
                department.push(deptID, deptName, overHead, totalSales, profit);       data.push(department);
            }
            
            // transform and display data
            output = table(data);
            console.log(output);

            // Return to main menu
            viewMenu();
        }
    );
}

function createDept(){

}