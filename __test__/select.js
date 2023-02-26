
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
    // console.table(runSQL(`SELECT category From products`, small_env, debug));
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
    // TODO: create a test for group by it 'there seems to be a bug in the in the process' FIX group by

}
