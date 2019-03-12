# bamazon

## Summary
Bamazon is a Node.js CLI app that functions like an online store. Three views - customer, manager, and supervisor - allow functionality that mimics shopping in a store, viewing and updating inventory, and viewing total sales by department. All bamazon data is stored in a MySQL database.

## npm modules used
inquirer, mysql, table

## Installation
* Clone this repository to the directory of your choice
* Run ` npm install `
* Run the SQL in ` schema.sql ` in MySQL Workbench; repeat for ` seeds.sql `  
* Run one of the following: ` node bamazonCustomer `, ` node bamazonManager `, ` node bamazonSupervisor `
* Manager View - username: ` manager ` password: ` hello `
* Supervisor View - username: ` supervisor ` password: ` hola `
* Follow the prompts related to the selected view

## Customer view
Bamazon browse view

![Bamazon Browse View](./images/customer_1.png)

Selecting a product for purchase

![Selecting a product for purchase](./images/customer_2.png)

Product purchased

![Product purchased](./images/customer_3.png)

**Demo:** coming soon

## Manager View
Manager main menu

![Manager main menu](./images/manager_1.png)

Updating inventory for selected product

![Updating inventory for selected product](./images/manager_2.png)

Inventory updated

![Inventory updated](./images/manager_3.png)

**Demo:** coming soon

## Supervisor View
Supervisor main menu

![Supervisor main menu](./images/supervisor_1.png)

Total Sales by department

![Total Sales by department](./images/supervisor_2.png)

**Demo:** coming soon