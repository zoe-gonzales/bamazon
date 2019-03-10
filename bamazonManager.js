
var mysql = require('mysql');
var inquirer = require('inquirer');

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

// Prompts user for manager login credentials
function logIn(){
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
        if (reply.user === 'manager' && reply.pass === 'hello'){
            viewMenu();
        } else {
            console.log('Incorrect credentials. Please try again.');
            logIn();
        }
    });
}

// Shows menu options through inquirer rawlist
function viewMenu(){
    console.log('Welcome to Bamazon Manager View!');
    inquirer
    .prompt(
        {
            type: 'rawlist',
            message: 'Please select a menu item from the following:',
            choices: ['View Products', 'View Products with Low Inventory', 'Update Current Inventory', 'Add New Product', 'Logout'],
            name: 'action'
        }
    ).then(function(reply){
        switch (reply.action){
            case 'View Products':
                viewProducts();
            break;
            case 'View Products with Low Inventory':
                lowInventory();
            break;
            case 'Update Current Inventory':
                updateInventory();
            break;
            case 'Add New Product':
                addProduct();
            break;
            case 'Logout':
                console.log('You are successfully logged out.');
                connection.end();
            break;
        }

    });
}

// Selects and displays all products in bamazon db
function viewProducts(){
    connection.query(
        'SELECT item_id, product_name, price, stock_quantity FROM products',
        function(error, response){
            if (error) throw error;
            for (var i=0; i < response.length; i++){
                console.log(
                    `Product name: ${response[i].product_name} | Product id: ${response[i].item_id} | Price per unit: $${response[i].price} | Quantity in Stock: ${response[i].stock_quantity} \n`
                );
            }
            promptNextAction();
        }
    );
}

// Selects and displays products with current stock of less than 5
function lowInventory(){
    connection.query(
        'SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 5',
        function(error, response){
            if (error) throw error;
            // Check in place in case there are no products with < 5 quantity
            if (response.length < 1){
                console.log('All products are sufficiently stocked.');
            } else {
                for (var i=0; i < response.length; i++){
                    console.log(`Product name: ${response[i].product_name} | Product id: ${response[i].item_id} | Quantity in Stock: ${response[i].stock_quantity} \n`);
                }
            }
            promptNextAction();
        }
    );
}

// Enables manager to update the stock quantity of existing product
function updateInventory(){
    // select query retrieves product names for display /  product id in order to execute the update query below
    connection.query(
        'SELECT product_name, item_id FROM products',
        function(error, selectResponse){
            if (error) throw error;
            inquirer
            .prompt([
                {
                    type: 'rawlist',
                    message: 'Which product would you like to restock?',
                    // generates product list from select query above
                    choices: function(){
                        var productsArr = [];
                        for (var i=0; i < selectResponse.length; i++){
                            productsArr.push(selectResponse[i].product_name);
                        }
                        return productsArr;
                    },
                    name: 'itemToUpdate'
                },
                {
                    name: 'newQuantity',
                    message: 'Please enter the total desired units for this product:',
                    // Validation requires that input is an integer greater than 0
                    validate: function(input){
                        if (isNaN(input) === false && input >= 0 && parseFloat(input) === parseInt(input)){
                            return true;
                        }
                        return false;
                    }
                }
            ]).then(function(reply){
                // identifies and assigns to new variable the object of current product
                var selectedProduct;
                for (var i=0; i < selectResponse.length; i++){
                    if (selectResponse[i].product_name === reply.itemToUpdate){
                        selectedProduct = selectResponse[i];
                    }
                }
                // update query replaces existing stock quantity with user input 
                connection.query(
                    'UPDATE products SET ? WHERE ?',
                    [
                        {
                            stock_quantity: reply.newQuantity
                        },
                        {
                            item_id: selectedProduct.item_id
                        }
                    ], 
                    function(error, updateResponse){
                        if (error) throw error;
                        console.log(`Inventory for ${updateResponse.affectedRows} product successfully updated.`);
                        promptNextAction();
                    }
                );
            });
        }
    );
}

// Enables manager to add a new product to bamazon db
function addProduct(){
    inquirer
    .prompt([
        {
            name: 'productName',
            message: 'Product name:',
            // Validation requires that input is not null
            validate: function(input){
                if (input){
                    return true;
                }
                return false;
            }
        },
        {
            name: 'department',
            message: 'Product department:',
            // Validation requires that input is not null
            validate: function(input){
                if (input){
                    return true;
                }
                return false;
            }
        },
        {
            name: 'productPrice',
            message: 'Price:',
            // Validation requires that input is a number greater than 0 - accepts floats
            validate: function(input){
                if (isNaN(input) === false && input > 0){
                    return true;
                }
                return false;
            }
        },
        {
            name: 'productQuantity',
            message: 'Stock Quantity:',
            // Validation requires that input is an integer greater than 0
            validate: function(input){
                if (isNaN(input) === false && input > 0 && parseFloat(input) === parseInt(input)){
                    return true;
                }
                return false;
            }
        }
    ]).then(function(reply){
        // inserting user input into bamazon
        connection.query(
            'INSERT INTO products SET ?',
            {
                product_name: reply.productName,
                department_name: reply.department,
                price: reply.productPrice,
                stock_quantity: reply.productQuantity
            },
            function(error, insertResponse){
                if (error) throw error;
                console.log(`${insertResponse.affectedRows} product successfully added.`);
                promptNextAction();
            }
        );
    });
}

// Prompts user to return to main menu or logout
function promptNextAction(){
    inquirer
    .prompt(
        {
            type: 'list',
            message: 'Please select from the menu choices below:',
            choices: ['Return to main menu', 'Logout'],
            name: 'nextAction'
        }
    ).then(function(reply){
        if (reply.nextAction === 'Return to main menu'){
            viewMenu();
        } else {
            console.log('Have a great day!');
            connection.end();
        }
    });
}