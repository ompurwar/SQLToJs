# Install:
$ `npm i`


# Developement:
open `__test__` directory
create a test file, for now we can start with select.js
```

import assert from 'assert';
import { products, users } from '../data.js';
import { runSQL, buildDbEnv } from '../index.js';

const tables = [
    { identifier: 'products', table: products.slice(0, 3) },

    { identifier: 'users', table: users.slice(0, 3) }
]
const functions = [];

// to query small set
const small_env = buildDbEnv(tables, functions); 

export default (env) => {
    const debug = true;

    assert.deepEqual(runSQL(`SELECT category From products`, small_env, debug), [
        { category: 'Electronics' },
        { category: 'Electronics' },
        { category: 'Electronics' }
    ]);
    
    // create your test here 
    .
    <your test here>

}

```