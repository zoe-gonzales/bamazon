
var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Queue72*8?',
    database: 'bamazon'
});

// connecting to bamazon db
connection.connect(function(error){
    if (error) console.log(error);
});

function LogIn(id, callback){
    this.logInUser = function(){
        inquirer
        .prompt([
            {
                name: 'user',
                message: 'Enter username:'
            },
            {
                type: 'password',
                message: 'Enter password',
                name: 'pass'
            }
        ]).then(function(reply){
            connection.query(
                'SELECT user_name, password FROM credentials WHERE user_id = ?',
                [id],
                function(error, response){
                    if (error) throw error;
                    var user = response[0].user_name;
                    var pass = response[0].password;
                    
                    if (reply.user === user && reply.pass === pass){
                        callback();
                    } else {
                        console.log('Incorrect credentials. Please try again.');
                        this.logInUser();
                    }
                }
            );
        });
    }
}

module.exports = LogIn;