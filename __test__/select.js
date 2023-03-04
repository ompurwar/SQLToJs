
import assert from 'assert';
import { products, users } from '../data.js';
import { runSQL, buildDbEnv } from '../index.js';

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
    // TODO: IMPLEMENT SQL UNION clause
    // TODO: IMPLEMENT INTERSECT clause
    // TODO: IMPLEMENT SUPPORT JOINS
    // SQL INNER JOIN
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


