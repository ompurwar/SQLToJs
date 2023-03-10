
import assert from 'assert';
import { products, users } from '../data.js';
import { runSQL, buildDbEnv, JOIN } from '../index.js';


const tables = [
    { identifier: 'products', table: products.slice(0, 3) },

    { identifier: 'users', table: users.slice(0, 3) }
]
const functions = [];




const small_env = buildDbEnv(tables, functions); // to query small set

export default (env) => {
    const debug = true;
    assert.deepStrictEqual(runSQL(`SELECT category From products`, small_env, debug), [
        { category: 'Electronics' },
        { category: 'Electronics' },
        { category: 'Electronics' }
    ]);

    assert.deepStrictEqual(runSQL(`SELECT category, price From products`, small_env, debug), [
        { category: 'Electronics', "price": 599.99, },
        { category: 'Electronics', "price": 1299.99, },
        { category: 'Electronics', "price": 199.99, }
    ]);

    assert.deepStrictEqual(runSQL(`SELECT category, price From products LIMIT 2`, small_env, debug), [
        { category: 'Electronics', "price": 599.99, },
        { category: 'Electronics', "price": 1299.99, }
    ]);

    assert.deepStrictEqual(runSQL(`SELECT category, price From products where price >= 1299.99 LIMIT 2`, small_env, debug), [
        { category: 'Electronics', "price": 1299.99, }
    ]);
    assert.deepStrictEqual(runSQL(`SELECT category, price From products where price > ALL(Select budget from users where id = 10 ) LIMIT 2`, small_env, debug), [
        { category: 'Electronics', "price": 599.99, },
        { category: 'Electronics', "price": 1299.99, }
    ]);
    assert.deepStrictEqual(runSQL(`SELECT category, price From products where price < ALL(Select budget from users where id = 2 ) LIMIT 2`, env, debug), [
        { "category": "Electronics", "price": 199.99 },
        { "category": "Footwear", "price": 89.99 }
    ]);
    assert.deepStrictEqual(runSQL(`SELECT category, price From products where price < 319 limit 2 `, env, debug), [
        { "category": "Electronics", "price": 199.99 },
        { "category": "Footwear", "price": 89.99 }
    ]);
    assert.deepStrictEqual(runSQL(`SELECT * From products where price = 49.99 AND manufacturer = 'Herschel' limit 2 `, env, debug), [

        { id: 5, "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel." }

    ]);
    assert.deepStrictEqual(runSQL(`SELECT * From products where (price BETWEEN 30 AND 50) AND manufacturer = 'Herschel' limit 2 `, env, debug), [
        { id: 5, "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel." }

    ]);
    // TODO: create a test for group by it 'there seems to be a bug in the in the process' FIX group by
    assert.deepStrictEqual(runSQL(`SELECT category,price From products where price < 50 group by category limit 3 `, env, debug), [
        { category: 'Accessories', price: 49.99 },
        { category: 'Fitness Equipment', price: 49.99 },
        { category: 'Clothing', price: 19.99 }
    ]);
    assert.deepStrictEqual(runSQL(`SELECT category,price From products where price < 50 group by price limit 3 `, env, debug), [
        { category: 'Accessories', price: 49.99 },
        { category: 'Clothing', price: 19.99 }

    ]);
    // create test and implement support for following aggregation functions
    // TODO:  1: create test and implement support for AVG()
    assert.deepStrictEqual(runSQL(`SELECT category,price,AVG(price) From products where category = 'Electronics' group by category  `, env, debug), [
        {
            category: 'Electronics',
            price: 599.99,
            'AVG(price)': 608.3249999999999,
        },

    ]);

    // TODO:  2: create test and implement support for COUNT() with and without DISTINCT
    assert.deepStrictEqual(runSQL(`SELECT category,price,SUM( price),AVG(price),COUNT(DISTINCT manufacturer) From products where category = 'Electronics' group by category`, env, debug), [
        {
            category: 'Electronics',
            price: 599.99,
            'SUM(price)': 3649.95,
            'AVG(price)': 608.3249999999999,
            'COUNT(DISTINCT manufacturer)': 5
        }
    ]);
    // TODO:  3: create test and implement support for SUM()
    assert.deepStrictEqual(runSQL(`SELECT category,price,SUM(price) From products group by category`, env, debug), [
        { category: 'Electronics', price: 599.99, 'SUM(price)': 3649.95 },
        { category: 'Footwear', price: 89.99, 'SUM(price)': 89.99 },
        { category: 'Accessories', price: 49.99, 'SUM(price)': 49.99 },
        { category: 'Kitchen Appliances', price: 79.99, 'SUM(price)': 79.99 },
        { category: 'Fitness Equipment', price: 49.99, 'SUM(price)': 49.99 },
        { category: 'Gaming Accessories', price: 69.99, 'SUM(price)': 69.99 },
        { category: 'Home Appliances', price: 199.99, 'SUM(price)': 199.99 },
        { category: 'Clothing', price: 19.99, 'SUM(price)': 19.99 }
    ]);
    assert.deepStrictEqual(runSQL(`SELECT category,price,SUM(price) From products where (category = 'Electronics') OR (category ='Footwear') group by category`, env, debug), [
        { category: 'Electronics', price: 599.99, 'SUM(price)': 3649.95 },
        { category: 'Footwear', price: 89.99, 'SUM(price)': 89.99 },
    ]);
    // TODO:  4: create test and implement support for MAX() with group by axcept aggr_func other fiels represent first item of the group in the order which they appear in main array
    assert.deepStrictEqual(runSQL(`SELECT name,category,price,MAX(price) From products where (category = 'Electronics') OR (category ='Footwear') group by category`, env, debug), [
        { "name": "Smartphone", "category": "Electronics", "price": 599.99, "MAX(price)": 1299.99, },
        { "name": "Sneakers", "category": "Footwear", "price": 89.99, "MAX(price)": 89.99 }
    ]);
    assert.deepStrictEqual(runSQL(`SELECT name,category,price,MAX(price) From products where (category = 'Electronics') OR (category ='Footwear')`, env, debug), [
        {
            name: 'Smartphone',
            category: 'Electronics',
            price: 599.99,
            'MAX(price)': 1299.99
        }
    ]);
    // TODO:  4: create test and implement support for MIN()
    assert.deepStrictEqual(runSQL('Select MIN(price) from  products', env), [{ 'MIN(price)': 19.99 }]);

    // TODO IMPLEMENT test for following operators 'LIKE' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL' | 'ALL'
    // TODO:  1: create test and implement support for 'LIKE' Operator
    assert.deepStrictEqual(runSQL('Select price,name from products where description LIKE \'The latest%\' ', env, debug), [{
        price: 599.99,
        name: 'Smartphone'
    }])
    // TODO:  2: create test and implement support for 'IN' Operator
    // TODO:  3: create test and implement support for 'IS NULL' Operator
    // TODO:  4: create test and implement support for'IS NOT NULL' Operator
    // TODO:  5: create test and implement support for'NOT IN' Operator
    // TODO:  6: create test and implement support for'ANY' Operator
    // TODO:  7: create test and implement support for'EXISTS' Operator
    // TODO:  8: create test and implement support for'ALL' Operator
    assert.deepStrictEqual(runSQL('Select * from products where price <= 319 ', env, debug), [
        { "id": 3, "name": "Smartwatch", "category": "Electronics", "price": 199.99, "manufacturer": "Fitbit", "description": "A fitness-focused smartwatch from Fitbit with heart rate monitoring and GPS." },
        { "id": 4, "name": "Sneakers", "category": "Footwear", "price": 89.99, "manufacturer": "Nike", "description": "A stylish and comfortable pair of sneakers from Nike, perfect for everyday wear." },
        { "id": 5, "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel." },
        { "id": 6, "name": "Blender", "category": "Kitchen Appliances", "price": 79.99, "manufacturer": "Vitamix", "description": "A powerful blender from Vitamix, perfect for making smoothies and soups." },
        { "id": 7, "name": "Dumbbells", "category": "Fitness Equipment", "price": 49.99, "manufacturer": "Bowflex", "description": "A set of adjustable dumbbells from Bowflex, great for home workouts." },
        { "id": 8, "name": "Gaming Mouse", "category": "Gaming Accessories", "price": 69.99, "manufacturer": "Logitech", "description": "A high-performance gaming mouse from Logitech with customizable RGB lighting." },
        { "id": 9, "name": "Headphones", "category": "Electronics", "price": 149.99, "manufacturer": "Sony", "description": "A wireless noise-cancelling headphones from Sony, perfect for music and podcasts." },
        { "id": 10, "name": "Smart Thermostat", "category": "Home Appliances", "price": 199.99, "manufacturer": "Nest", "description": "A smart thermostat from Nest that learns your preferences and can be controlled remotely." },
        { "id": 11, "name": "T-Shirt", "category": "Clothing", "price": 19.99, "manufacturer": "Uniqlo", "description": "A soft and comfortable t-shirt from Uniqlo, available in various colors and sizes." }
    ])

    // TODO: IMPLEMENT given scalar functions <scalar_function> -> UCASE '(' <identifier> ')' | LCASE '(' <identifier> ')' | MID '(' <identifier> ',' <integer> ',' <integer> ')' | LEN '(' <identifier> ')' | ROUND '(' <identifier> ',' <integer> ')' | NOW '(' ')' | FORMAT '(' <identifier> ',' <integer> ')'
    // TODO: IMPLEMENT HEAVING BY clause
    let heaving_result = runSQL(`SELECT category,price,AVG(price) From products group by category Having AVG(price)>200`, env, debug)
    // console.log(heaving_result)
    assert.deepStrictEqual(heaving_result, [
        {
            'AVG(price)': 608.3249999999999,
            category: 'Electronics',
            price: 599.99
        }
    ]);
    heaving_result = runSQL(`SELECT category,COUNT(*) From products group by category Having Count(*)>2`, env, debug)
    // console.log(heaving_result)
    assert.deepStrictEqual(heaving_result, [
        {
            'COUNT(*)': 6,
            category: 'Electronics'
        }
    ]);
    //  list payment methods used more then twice
    heaving_result = runSQL(`SELECT order_id,payment_method,COUNT(*) From payments group by payment_method having COUNT(*)>1 `, env, debug)
    // console.log(heaving_result)
    assert.deepStrictEqual(heaving_result, [
        { order_id: 1, payment_method: 'Credit Card', 'COUNT(*)': 6 },
        { order_id: 2, payment_method: 'PayPal', 'COUNT(*)': 2 }
    ]);
    // TODO: IMPLEMENT ORDER BY clause

    // order by desc
    assert.deepStrictEqual(runSQL(`SELECT  * From (select price from products) Order by price DESC`, env, debug), [
        { price: 1299.99 },
        { price: 799.99 },
        { price: 600 },
        { price: 599.99 },
        { price: 199.99 },
        { price: 199.99 },
        { price: 149.99 },
        { price: 89.99 },
        { price: 79.99 },
        { price: 69.99 },
        { price: 49.99 },
        { price: 49.99 },
        { price: 19.99 },

    ]);

    //  multi column
    const employees = [
        { firstName: 'John', lastName: 'Doe', salary: 5000 },
        { firstName: 'Jane', lastName: 'Doe', salary: 6000 },
        { firstName: 'Jim', lastName: 'Brown', salary: 5500 },
        { firstName: 'Jake', lastName: 'Blues', salary: 6500 }
    ];
    const employees_env = buildDbEnv([{ identifier: 'employees', table: employees }]);
    assert.deepStrictEqual(
        runSQL(`SELECT * FROM employees ORDER BY lastName ASC, firstName ASC`, employees_env, debug),
        [{ "firstName": "Jake", "lastName": "Blues", "salary": 6500 },
        { "firstName": "Jim", "lastName": "Brown", "salary": 5500 },
        { "firstName": "Jane", "lastName": "Doe", "salary": 6000 },
        { "firstName": "John", "lastName": "Doe", "salary": 5000 }]);
    // assert.deepStrictEqual(
    //     runSQL(`SELECT *
    //     FROM orders o
    //     JOIN customers c ON o.customer_id = c.customer_id
    //     JOIN order_items oi ON o.order_id = oi.order_id
    //         AND oi.order_item_date > '2022-01-01'`, employees_env, debug),
    //     [{ "firstName": "Jake", "lastName": "Blues", "salary": 6500 },
    //     { "firstName": "Jim", "lastName": "Brown", "salary": 5500 },
    //     { "firstName": "Jane", "lastName": "Doe", "salary": 6000 },
    //     { "firstName": "John", "lastName": "Doe", "salary": 5000 }]);
    // TODO: IMPLEMENT SQL UNION clause
    // TODO: IMPLEMENT INTERSECT clause
    // TODO: IMPLEMENT SUPPORT JOINS
    // SQL INNER JOIN

    assert.deepStrictEqual(runSQL(`
    SELECT *
    FROM (select * from orders where quantity=1 )
    INNER JOIN payments ON payments.order_id = orders.id and payments.status = 'Paid'
    INNER JOIN users ON orders.user_id=users.id AND orders.id between 1 AND 6
    JOIN products ON products.id = orders.product_id `, env, debug),
        [
            {
                id: 1,
                user_id: 5,
                product_id: 1,
                quantity: 1,
                'payments.id': 1,
                'payments.order_id': 1,
                'payments.amount': 599.99,
                'payments.payment_method': 'Credit Card',
                'payments.status': 'Paid',
                'users.id': 5,
                'users.budget': 904,
                'users.name': 'User 5',
                'users.marks': 77,
                'products.id': 1,
                'products.name': 'Smartphone',
                'products.category': 'Electronics',
                'products.price': 599.99,
                'products.manufacturer': 'Samsung',
                'products.description': 'The latest smartphone from Samsung with a 6.5 inch OLED display and 5G connectivity.'
            },
            {
                id: 3,
                user_id: 9,
                product_id: 8,
                quantity: 1,
                'payments.id': 3,
                'payments.order_id': 3,
                'payments.amount': 69.99,
                'payments.payment_method': 'Apple Pay',
                'payments.status': 'Paid',
                'users.id': 9,
                'users.budget': 756,
                'users.name': 'User 9',
                'users.marks': 72,
                'products.id': 8,
                'products.name': 'Gaming Mouse',
                'products.category': 'Gaming Accessories',
                'products.price': 69.99,
                'products.manufacturer': 'Logitech',
                'products.description': 'A high-performance gaming mouse from Logitech with customizable RGB lighting.'
            },
            {
                id: 5,
                user_id: 10,
                product_id: 2,
                quantity: 1,
                'payments.id': 5,
                'payments.order_id': 5,
                'payments.amount': 1299.99,
                'payments.payment_method': 'Credit Card',
                'payments.status': 'Paid',
                'users.id': 10,
                'users.budget': 502,
                'users.name': 'User 10',
                'users.marks': 95,
                'products.id': 2,
                'products.name': 'Laptop',
                'products.category': 'Electronics',
                'products.price': 1299.99,
                'products.manufacturer': 'Apple',
                'products.description': 'A powerful laptop from Apple with a 13 inch Retina display and an M1 chip.'
            }


        ]);
    // LEFT JOIN

    assert.deepStrictEqual(runSQL(`
        SELECT *
        FROM users
        left JOIN orders ON orders.user_id = users.id`, env, debug),
        [
            {
                id: 1,
                budget: 564,
                name: 'User 1',
                marks: 85,
                'orders.id': 6,
                'orders.user_id': 1,
                'orders.product_id': 6,
                'orders.quantity': 1
            },
            {
                id: 2,
                budget: 319,
                name: 'User 2',
                marks: 47,
                'orders.id': 2,
                'orders.user_id': 2,
                'orders.product_id': 3,
                'orders.quantity': 2
            },
            {
                id: 3,
                budget: 713,
                name: 'User 3',
                marks: 92,
                'orders.id': 8,
                'orders.user_id': 3,
                'orders.product_id': 12,
                'orders.quantity': 1
            },
            {
                id: 4,
                budget: 498,
                name: 'User 4',
                marks: 60,
                'orders.id': 4,
                'orders.user_id': 4,
                'orders.product_id': 5,
                'orders.quantity': 3
            },
            {
                id: 5,
                budget: 904,
                name: 'User 5',
                marks: 77,
                'orders.id': 1,
                'orders.user_id': 5,
                'orders.product_id': 1,
                'orders.quantity': 1
            },
            {
                id: 6,
                budget: 268,
                name: 'User 6',
                marks: 34,
                'orders.id': 10,
                'orders.user_id': 6,
                'orders.product_id': 4,
                'orders.quantity': 1
            },
            {
                id: 7,
                budget: 138,
                name: 'User 7',
                marks: 89,
                'orders.id': 7,
                'orders.user_id': 7,
                'orders.product_id': 10,
                'orders.quantity': 2
            },
            {
                id: 8,
                budget: 849,
                name: 'User 8',
                marks: 55,
                'orders.id': 9,
                'orders.user_id': 8,
                'orders.product_id': 9,
                'orders.quantity': 1
            },
            {
                id: 9,
                budget: 756,
                name: 'User 9',
                marks: 72,
                'orders.id': 3,
                'orders.user_id': 9,
                'orders.product_id': 8,
                'orders.quantity': 1
            },
            {
                id: 10,
                budget: 502,
                name: 'User 10',
                marks: 95,
                'orders.id': 5,
                'orders.user_id': 10,
                'orders.product_id': 2,
                'orders.quantity': 1
            },
            { id: 11, budget: 502, name: 'User 11', marks: 95 }
        ]);
    // LEFT AND right join
    assert.deepStrictEqual(runSQL(`
        SELECT id,orders.product_id,payments.amount,payments.status,name,orders.quantity
        FROM users
        left JOIN orders ON orders.user_id = users.id 
        INNER JOIN payments ON payments.order_id = orders.id and payments.status = 'Paid' `, env, debug),
        [
            {
                id: 1,
                'orders.product_id': 6,
                'payments.amount': 599.99,
                'payments.status': 'Paid',
                name: 'User 1',
                'orders.quantity': 1
            },
            {
                id: 2,
                'orders.product_id': 3,
                'payments.amount': 399.98,
                'payments.status': 'Paid',
                name: 'User 2',
                'orders.quantity': 2
            },
            {
                id: 3,
                'orders.product_id': 12,
                'payments.amount': 69.99,
                'payments.status': 'Paid',
                name: 'User 3',
                'orders.quantity': 1
            },
            {
                id: 4,
                'orders.product_id': 5,
                'payments.amount': 269.97,
                'payments.status': 'Paid',
                name: 'User 4',
                'orders.quantity': 3
            },
            {
                id: 5,
                'orders.product_id': 1,
                'payments.amount': 1299.99,
                'payments.status': 'Paid',
                name: 'User 5',
                'orders.quantity': 1
            },
            {
                id: 6,
                'orders.product_id': 4,
                'payments.amount': 79.99,
                'payments.status': 'Paid',
                name: 'User 6',
                'orders.quantity': 1
            },
            {
                id: 10,
                'orders.product_id': 2,
                'payments.amount': 89.99,
                'payments.status': 'Paid',
                name: 'User 10',
                'orders.quantity': 1
            }
        ]);
    // RIGHT JOIN
    assert.deepStrictEqual(runSQL(`
        SELECT amount  , payment_method 
        FROM orders b
        RIGHT JOIN payments ON payments.order_id = orders.id and payments.status = 'Paid' `, env, debug),
        [
            { amount: 599.99, payment_method: 'Credit Card' },
            { amount: 399.98, payment_method: 'PayPal' },
            { amount: 69.99, payment_method: 'Apple Pay' },
            { amount: 269.97, payment_method: 'Google Pay' },
            { amount: 1299.99, payment_method: 'Credit Card' },
            { amount: 79.99, payment_method: 'Credit Card' },
            { amount: 399.98, payment_method: 'PayPal' },
            { amount: 600, payment_method: 'Credit Card' },
            { amount: 149.99, payment_method: 'Credit Card' },
            { amount: 89.99, payment_method: 'Credit Card' }
        ]);

 
    // SQL LEFT JOIN
    // SQL SELF JOIN
    // SQL FULL OUTER JOIN
    // TODO: IMPLEMENT SUPPORT for  sub queries
    assert.deepStrictEqual(runSQL(`SELECT  * From (select price from products)`, env, debug), [
        { price: 599.99 },
        { price: 1299.99 },
        { price: 199.99 },
        { price: 89.99 },
        { price: 49.99 },
        { price: 79.99 },
        { price: 49.99 },
        { price: 69.99 },
        { price: 149.99 },
        { price: 199.99 },
        { price: 19.99 },
        { price: 600 },
        { price: 799.99 }

    ]);

    // TODO: IMPLEMENT SUPPORT for  DISTINCT for SELECT clause

    // DISTINCT with single column
    assert.deepStrictEqual(runSQL(`select DISTINCT price from products where price < 100`, env, debug), [
        { price: 89.99 },
        { price: 49.99 },
        { price: 79.99 },
        { price: 69.99 },
        { price: 19.99 }

    ]);
    // DISTINCT with multiple column
    assert.deepStrictEqual(runSQL(`select DISTINCT manufacturer,price from products where price < 100`, env, debug), [
        { manufacturer: 'Nike', price: 89.99 },
        { manufacturer: 'Herschel', price: 49.99 },
        { manufacturer: 'Vitamix', price: 79.99 },
        { manufacturer: 'Bowflex', price: 49.99 },
        { manufacturer: 'Logitech', price: 69.99 },
        { manufacturer: 'Uniqlo', price: 19.99 }

    ]);


}


