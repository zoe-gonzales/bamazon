
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
    start();
});

// Runs immediately on connection - prompts user to browse bamazon or exit
function start(){
    inquirer
    .prompt(
        {
            type: 'list',
            choices: ['Browse Bamazon', 'Exit'],
            name: 'action',
            message: 'Welcome to Bamazon! Please select an action below'
        }
    ).then(function(reply){
        if (reply.action === 'Browse Bamazon'){
            browseBamazon();
        } else connection.end();
    });
}

// Runs select query to retrieve all products from bamazon db from the columns: product_name, item_id, and price
function browseBamazon(){
    connection.query(
        'SELECT product_name, item_id, price FROM products',
        function(error, response){
        if (error) throw error;
        inquirer
        .prompt(
            {
                type: 'rawlist',
                name: 'item',
                message: 'Items available for purchase:',
                // displays all products currently in bamazon db
                choices: function(){
                    var products = [];
                    for (var i=0; i < response.length; i++){
                        products.push(response[i].product_name);
                    }
                    return products;
                }
            }
        ).then(function(reply){
            // Displays name, id, and price for selected product
            var selectedItem;
            for (var i=0; i < response.length; i++){
                if (response[i].product_name === reply.item){
                    selectedItem = response[i];
                    console.log(`Product: ${response[i].product_name} \n Id: ${response[i].item_id} \n Price: $${response[i].price}`);
                }
            }
            // prompts for id to confirm and the desired quantity
            inquirer
            .prompt([
                {
                    name: 'id',
                    message: "Please confirm the id of the requested product."
                },
                {
                    name: 'quantity',
                    message: `How many ${selectedItem.product_name}s would you like to buy?`,
                    // Validation that input is an integer greater than 0 
                    validate: function(input){
                        if (isNaN(input) === false && input > 0 && parseFloat(input) === parseInt(input)){
                            return true;
                        }
                        return false;
                    }
                }
            ]).then(function(reply){
                // saving & parsing input
                var id = parseInt(reply.id);
                var quant = parseInt(reply.quantity);
                // Checking if requested quantity of product exists in bamazon
                checkItemQuantity(id, quant);
            });
        });
    });
}

function checkItemQuantity(product_id, requested_num){
    connection.query(
        'SELECT stock_quantity, price, product_sales FROM products WHERE ?',
        {
            item_id: product_id
        },
        function(error, response){
            if (error) throw error;
            // Check that there is adequate quantity to complete transaction
            var itemQuantity = response[0].stock_quantity;
            if (itemQuantity >= requested_num){
                // if there's enough, update quantity and run function to update in bamazon
                itemQuantity -= requested_num;
                var productDetails = {
                    itemQuantity: itemQuantity,
                    requestedNum: requested_num,
                    totalSales: response[0].product_sales,
                    productId: product_id,
                    productPrice: response[0].price
                }
                updateItemQuantity(productDetails);
            } else {
                // Else notify customer
                console.log('Insufficient quantity for this item.');
            }
        }
    );
}

function updateItemQuantity(obj){
    // Generates customer's total and prints to console
    var customerTotal = obj.requestedNum * obj.productPrice;
    console.log(`Your cart's total is $${customerTotal}.`);
    
    // Prompts customer if they'd like to go through with transaction
    inquirer
    .prompt(
        {
            type: 'confirm',
            message: "Would you like to place this order now?",
            default: false,
            name: 'purchase'
        }
    ).then(function(reply){
        if (reply.purchase){
            // if yes, runs update query to reduce stock_quantity of product by customer's request quantity
            obj.totalSales += customerTotal;
            connection.query(
                'UPDATE products SET ? WHERE item_id = ?',
                [
                    {
                        stock_quantity: obj.itemQuantity,
                        product_sales: obj.totalSales
                    },

                    obj.productId
                ],
                function(error){
                    if (error) throw error;
                    // Notification of successful update
                    console.log('Order placed!');
                    start();
                }
            );
        } else {
            // exits from product page and goes back to main menu
            console.log('Come back again soon!');
            start();
        }
    });
}

