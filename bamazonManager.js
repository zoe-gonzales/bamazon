
var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Queue72*8?',
    database: 'bamazon'
});

connection.connect(function(error){
    if (error) console.log(error);
    // console.log('connected as id ' + connection.threadId);
    // logIn();
    viewMenu();
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
                connection.end();
            break;
        }

    });
}

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

function lowInventory(){
    connection.query(
        'SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 5',
        function(error, response){
            if (error) throw error;
            for (var i=0; i < response.length; i++){
                console.log(
                    `Product name: ${response[i].product_name} | Product id: ${response[i].item_id} | Quantity in Stock: ${response[i].stock_quantity} \n`
                );
            }
            promptNextAction();
        }
    );
}

function updateInventory(){
    connection.query(
        'SELECT product_name, item_id FROM products',
        function(error, selectResponse){
            if (error) throw error;
            inquirer
            .prompt([
                {
                    type: 'rawlist',
                    message: 'Which product would you like to restock?',
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
                    validate: function(input){
                        if (isNaN(input) === false && input >= 0){
                            return true;
                        }
                        return false;
                    }
                }
            ]).then(function(reply){
                var selectedProduct;
                for (var i=0; i < selectResponse.length; i++){
                    if (selectResponse[i].product_name === reply.itemToUpdate){
                        selectedProduct = selectResponse[i];
                    }
                }
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
                        console.log(`Inventory for ${updateResponse.affectedRows} item successfully updated.`);
                        promptNextAction();
                    }
                );
            });
        }
    );
}

// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
function addProduct(){

}

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