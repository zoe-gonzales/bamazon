
// Node packages
var mysql = require('mysql');
var inquirer = require('inquirer');

// Manager View Main Menu details
var managerView = {
    type: 'Manager',
    options: ['View Products', 'View Products with Low Inventory', 'Update Current Inventory', 'Add New Product', 'Delete a Product', 'Logout'],
    actions: {
        action1: viewProducts,
        action2: lowInventory,
        action3: updateInventory,
        action4: addProduct,
        action5: deleteProduct,
        action6: function(){
            console.log('You have successfully logged out.');
            logIn.logOutUser();
            connection.end();
        }
    },
}

// Constructors
var ViewMenu = require('./constructors/mainMenu');
var view = new ViewMenu(managerView);
var LogIn = require('./constructors/logIn');
var logIn = new LogIn(1, view.viewMainMenu);
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
    // Prompts user for manager login credentials
    logIn.logInUser();
});

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
                    validate: input => validation.validInt(input)
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
            validate: input => validation.validStr(input)
        },
        {
            name: 'department',
            message: 'Product department:',
            validate: input => validation.validStr(input)
        },
        {
            name: 'productPrice',
            message: 'Price:',
            validate: input => validation.validNum(input)
        },
        {
            name: 'productQuantity',
            message: 'Stock Quantity:',
            validate: input => validation.validInt(input)
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

// Enables manager to delete product from inventory
function deleteProduct(){
    connection.query(
        'SELECT product_name, item_id FROM products',
        function(error, selectResponse){
            inquirer
            .prompt(
                {
                    name: 'productToDelete',
                    message: 'Which product would you like to remove?',
                    type: 'rawlist',
                    // generates product list from select query above
                    choices: function(){
                        var productsArr = [];
                        for (var i=0; i < selectResponse.length; i++){
                            productsArr.push(selectResponse[i].product_name);
                        }
                        return productsArr;
                    }
                }
            ).then(function(reply){
                var selectedProduct;
                for (var i=0; i < selectResponse.length; i++){
                    if (selectResponse[i].product_name === reply.productToDelete){
                        selectedProduct = selectResponse[i];
                    }
                }
                // delete query to remove item from bamazon
                connection.query(
                    'DELETE FROM products WHERE ?',
                    {
                        item_id: selectedProduct.item_id
                    },
                    function(error, deleteResponse){
                        if (error) throw error;
                        console.log(`${deleteResponse.affectedRows} product deleted.`);
                        promptNextAction();
                    }
                );
            });
        }
    );    
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
            view.viewMainMenu();
        } else if (reply.nextAction === 'Logout'){
            console.log('Have a great day!');
            logIn.logOutUser();
            connection.end();
        }
    });
}