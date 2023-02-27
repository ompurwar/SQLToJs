
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
    assert.deepEqual(runSQL(`SELECT category From products`, small_env, debug), [
        { category: 'Electronics' },
        { category: 'Electronics' },
        { category: 'Electronics' }
    ]);

    assert.deepEqual(runSQL(`SELECT category, price From products`, small_env, debug), [
        { category: 'Electronics', "price": 599.99, },
        { category: 'Electronics', "price": 1299.99, },
        { category: 'Electronics', "price": 199.99, }
    ]);

    assert.deepEqual(runSQL(`SELECT category, price From products LIMIT 2`, small_env, debug), [
        { category: 'Electronics', "price": 599.99, },
        { category: 'Electronics', "price": 1299.99, }
    ]);

    assert.deepEqual(runSQL(`SELECT category, price From products where price >= 1299.99 LIMIT 2`, small_env, debug), [
        // { category: 'Electronics', "price": 599.99, },
        { category: 'Electronics', "price": 1299.99, }
    ]);
    assert.deepEqual(runSQL(`SELECT category, price From products where price > ALL(Select budget from users where id = 10 ) LIMIT 2`, small_env, debug), [
        { category: 'Electronics', "price": 599.99, },
        { category: 'Electronics', "price": 1299.99, }
    ]);
    assert.deepEqual(runSQL(`SELECT category, price From products where price < ALL(Select budget from users where id = 2 ) LIMIT 2`, env, debug), [
        { "category": "Electronics", "price": 199.99 },
        { "category": "Footwear", "price": 89.99 },
        // { "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel." },

    ]);
    assert.deepEqual(runSQL(`SELECT category, price From products where price < 319 limit 2 `, env, debug), [
        { "category": "Electronics", "price": 199.99 },
        { "category": "Footwear", "price": 89.99 },
        // { "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel." },

    ]);
    assert.deepEqual(runSQL(`SELECT * From products where price = 49.99 AND manufacturer = 'Herschel' limit 2 `, env, debug), [
        // { "category": "Electronics", "price": 199.99 },
        // { "category": "Footwear", "price": 89.99 },
        { "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel." },

    ]);
    assert.deepEqual(runSQL(`SELECT * From products where (price BETWEEN 30 AND 50) AND manufacturer = 'Herschel' limit 2 `, env, debug), [
        // { "category": "Electronics", "price": 199.99 },
        // { "category": "Footwear", "price": 89.99 },
        { "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel." },

    ]);
    // TODO: create a test for group by it 'there seems to be a bug in the in the process' FIX group by
    assert.deepEqual(runSQL(`SELECT category,price From products where price < 50 group by category limit 3 `, env, debug), [
        { category: 'Accessories', price: 49.99 },
        { category: 'Fitness Equipment', price: 49.99 },
        { category: 'Clothing', price: 19.99 }
        // { "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel.", "Accessories": [{ "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel." }] },

        // { "name": "Dumbbells", "category": "Fitness Equipment", "price": 49.99, "manufacturer": "Bowflex", "description": "A set of adjustable dumbbells from Bowflex, great for home workouts.", "Fitness Equipment": [{ "name": "Dumbbells", "category": "Fitness Equipment", "price": 49.99, "manufacturer": "Bowflex", "description": "A set of adjustable dumbbells from Bowflex, great for home workouts." }] },

        // { "name": "T-Shirt", "category": "Clothing", "price": 19.99, "manufacturer": "Uniqlo", "description": "A soft and comfortable t-shirt from Uniqlo, available in various colors and sizes.", "Clothing": [{ "name": "T-Shirt", "category": "Clothing", "price": 19.99, "manufacturer": "Uniqlo", "description": "A soft and comfortable t-shirt from Uniqlo, available in various colors and sizes." }] },

    ]);
    assert.deepEqual(runSQL(`SELECT category,price From products where price < 50 group by price limit 3 `, env, debug), [
        { category: 'Accessories', price: 49.99 },
        // { category: 'Fitness Equipment', price: 49.99 },
        { category: 'Clothing', price: 19.99 }
        // { "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel.", "Accessories": [{ "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel." }] },

        // { "name": "Dumbbells", "category": "Fitness Equipment", "price": 49.99, "manufacturer": "Bowflex", "description": "A set of adjustable dumbbells from Bowflex, great for home workouts.", "Fitness Equipment": [{ "name": "Dumbbells", "category": "Fitness Equipment", "price": 49.99, "manufacturer": "Bowflex", "description": "A set of adjustable dumbbells from Bowflex, great for home workouts." }] },

        // { "name": "T-Shirt", "category": "Clothing", "price": 19.99, "manufacturer": "Uniqlo", "description": "A soft and comfortable t-shirt from Uniqlo, available in various colors and sizes.", "Clothing": [{ "name": "T-Shirt", "category": "Clothing", "price": 19.99, "manufacturer": "Uniqlo", "description": "A soft and comfortable t-shirt from Uniqlo, available in various colors and sizes." }] },

    ]);
    // TODO: create test and implement support for following aggregation functions
    // TODO:  1: create test and implement support for AVG()
    assert.deepEqual(runSQL(`SELECT category,price,SUM(price),AVG(price),COUNT(0) From products where category = 'Electronics' group by category  `, env, debug), [
        {
            category: 'Electronics',
            price: 599.99,
            'SUM(price)': 3649.95,
            'AVG(price)':  608.3249999999999,
            'COUNT(0)': 6
        },
        // { category: 'Fitness Equipment', price: 49.99 },
        // { category: 'Clothing', price: 19.99 }
        // { "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel.", "Accessories": [{ "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel." }] },

        // { "name": "Dumbbells", "category": "Fitness Equipment", "price": 49.99, "manufacturer": "Bowflex", "description": "A set of adjustable dumbbells from Bowflex, great for home workouts.", "Fitness Equipment": [{ "name": "Dumbbells", "category": "Fitness Equipment", "price": 49.99, "manufacturer": "Bowflex", "description": "A set of adjustable dumbbells from Bowflex, great for home workouts." }] },

        // { "name": "T-Shirt", "category": "Clothing", "price": 19.99, "manufacturer": "Uniqlo", "description": "A soft and comfortable t-shirt from Uniqlo, available in various colors and sizes.", "Clothing": [{ "name": "T-Shirt", "category": "Clothing", "price": 19.99, "manufacturer": "Uniqlo", "description": "A soft and comfortable t-shirt from Uniqlo, available in various colors and sizes." }] },

    ]);
    // TODO:  2: create test and implement support for COUNT()
    // TODO:  3: create test and implement support for SUM()
    assert.deepEqual(runSQL(`SELECT category,price,SUM(price) From products group by category`, env, debug), [
        { category: 'Electronics', price: 599.99, 'SUM(price)': 3649.95 },
        { category: 'Footwear', price: 89.99, 'SUM(price)': 89.99 },
        { category: 'Accessories', price: 49.99, 'SUM(price)': 49.99 },
        {
            category: 'Kitchen Appliances',
            price: 79.99,
            'SUM(price)': 79.99
        },
        {
            category: 'Fitness Equipment',
            price: 49.99,
            'SUM(price)': 49.99
        },
        {
            category: 'Gaming Accessories',
            price: 69.99,
            'SUM(price)': 69.99
        },
        {
            category: 'Home Appliances',
            price: 199.99,
            'SUM(price)': 199.99
        },
        { category: 'Clothing', price: 19.99, 'SUM(price)': 19.99 }
    ]);
    assert.deepEqual(runSQL(`SELECT category,price,SUM(price) From products where (category = 'Electronics') OR (category ='Footwear') group by category`, env, debug), [
        { category: 'Electronics', price: 599.99, 'SUM(price)': 3649.95 },
        { category: 'Footwear', price: 89.99, 'SUM(price)': 89.99 },
    ]);
    // TODO:  4: create test and implement support for MAX()
    // TODO:  4: create test and implement support for MIN()
    // TODO IMPLEMENT test for following operators '+' | '-' | '*' | '/' | '%' | '=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL' | 'AND' | 'OR' | 'NOT'
    // TODO:  1: create test and implement support for 'NOT IN' Operator
    // TODO:  2: create test and implement support for 'IS NULL' Operator
    // TODO:  3: create test and implement support for'IS NOT NULL' Operator
    // TODO:  4: create test and implement support for'NOT IN' Operator
    // TODO:  5: create test and implement support for'ANY' Operator
    // TODO:  6: create test and implement support for'EXISTS' Operator

    // TODO: IMPLEMENT given scalar functions <scalar_function> -> UCASE '(' <identifier> ')' | LCASE '(' <identifier> ')' | MID '(' <identifier> ',' <integer> ',' <integer> ')' | LEN '(' <identifier> ')' | ROUND '(' <identifier> ',' <integer> ')' | NOW '(' ')' | FORMAT '(' <identifier> ',' <integer> ')'
    // TODO: IMPLEMENT HEAVING BY clause
    // TODO: IMPLEMENT ORDER BY clause
    // TODO: IMPLEMENT SQL UNION clause
    // TODO: IMPLEMENT INTERSECT clause
    // TODO: IMPLEMENT SUPPORT JOINS
    // SQL INNER JOIN
    // SQL LEFT JOIN
    // SQL SELF JOIN
    // SQL FULL OUTER JOIN


}


