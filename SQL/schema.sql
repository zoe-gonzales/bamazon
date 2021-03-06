
DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    item_id INTEGER AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(50) NULL,
    department_name VARCHAR(50) NULL,
    price DECIMAL(5, 2) NULL,
    stock_quantity INTEGER NULL,
    product_sales DECIMAL(10, 2) NULL,
    PRIMARY KEY (item_id)
);

CREATE TABLE departments (
    department_id INTEGER AUTO_INCREMENT NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    over_head_costs DECIMAL(10, 2) NULL,
    PRIMARY KEY (department_id)
);

CREATE TABLE credentials (
    user_id INTEGER AUTO_INCREMENT NOT NULL,
    user_name VARCHAR(30) NOT NULL,
    password VARCHAR(30) NOT NULL,
    PRIMARY KEY (user_id)
);