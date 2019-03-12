
var inquirer = require('inquirer');

function ViewMenu(obj){
    this.viewMainMenu = function(){
        console.log(`Welcome to Bamazon ${obj.type} View!`);
        inquirer
        .prompt(
            {
                type: 'rawlist',
                message: 'Please select a menu item from the following:',
                choices: obj.options,
                name: 'action'
            }
        ).then(function(reply){
            var actionType = 'action';
            for (var i=0; i < obj.options.length; i++){
                if (obj.options[i] === reply.action){
                    actionType += i + 1;
                    obj.actions[actionType]();
                }
            }
        });
    }
}

module.exports = ViewMenu;
    