
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
    start();
});

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

// Include the ids, names, and prices of products for sale
function browseBamazon(){
    connection.query(
        'SELECT * FROM products',
        function(error, response){
        if (error) throw error;
        inquirer
        .prompt(
            {
                type: 'rawlist',
                name: 'item',
                message: 'Items available for purchase:',
                choices: function(){
                    var products = [];
                    for (var i=0; i < response.length; i++){
                        products.push(response[i].product_name);
                    }
                    return products;
                }
            }
        ).then(function(reply){
            var selectedItem;
            for (var i=0; i < response.length; i++){
                if (response[i].product_name === reply.item){
                    selectedItem = response[i];
                    console.log(`Product: ${response[i].product_name} \n Id: ${response[i].item_id} \n Price: $${response[i].price}`);
                }
            }
            inquirer
            .prompt([
                {
                    name: 'id',
                    message: "Please confirm the id of the requested product."
                },
                {
                    name: 'quantity',
                    message: `How many ${selectedItem.product_name}s would you like to buy?`,
                    validate: function(input){
                        if (isNaN(input) === false){
                            return true;
                        }
                        return false;
                    }
                }
            ]).then(function(reply){
                var id = parseInt(reply.id);
                var quant = parseInt(reply.quantity);
                checkItemQuantity(id, quant);
            });
        });
    });
}

function checkItemQuantity(product_id, requested_num){
    connection.query(
        'SELECT stock_quantity, price FROM products WHERE ?',
        {
            item_id: product_id
        },
        function(error, response){
            if (error) throw error;
            var itemQuantity = response[0].stock_quantity;
            if (itemQuantity >= requested_num){
                itemQuantity -= requested_num;
                updateItemQuantity(itemQuantity, requested_num, product_id, response[0].price);
            } else {
                console.log('Insufficient quantity for this item.');
            }
        }
    );
}

function updateItemQuantity(quantity, requested, product_id, product_price){
    var customerTotal = requested * product_price;
    console.log(`Your total cost is $${customerTotal}.`);
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
            connection.query(
                'UPDATE products SET stock_quantity = ? WHERE item_id = ?',
                [quantity, product_id],
                function(error){
                    if (error) throw error;
                    console.log('Order placed!');
                    start();
                }
            );
        } else {
            console.log('Come back again soon!');
            start();
        }
    });
}

