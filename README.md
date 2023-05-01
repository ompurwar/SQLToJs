# SqlToJs

SqlToJs is a library that allows you to run SQL queries over JavaScript object arrays.


## Installation
🎉👏🚀 Thank you for choosing SqlToJs! We hope you find it useful. 💻💪

The library is not published yet, but you can download the source code from the [GitHub repository](https://github.com/your-username/sql-to-js) and use it in your project.

To use the library in your project, simply include the `./path-to-index.js-file-of-liberary` file in your HTML file:

```html
<script src="./path-to-index.js-file-of-liberary"></script>
```

## Usage

To use the library, you first need to create a JavaScript object array that contains your data. Here's an example:

```javascript
const users = [
  { id: 1, name: 'John', age: 25 },
  { id: 2, name: 'Mary', age: 30 },
  { id: 3, name: 'Peter', age: 35 },
];
```

Once you have your data, you can run SQL queries over it using the `runSQL()` method. Here's an example:

```javascript
import { runSQL, buildDbEnv } from './path-to-index.js-file-of-liberary';
const tables = [
    { identifier: 'users', table: users }
]
const small_env = buildDbEnv(tables); 
const result = runSQL('SELECT name FROM data WHERE age > 30',small_env);
console.log(result);
```

This will output:

```javascript
[
  { name: 'Peter' },
]
```

## Contribution

We welcome contributions to the SqlToJs library. If you find a bug, have a feature request, or want to contribute code, please open an issue or pull request on the [GitHub repository](https://github.com/ompurwar/SQLToJs).

### Make sure you have nodejs installed

run ``` npm run test ``` in the root directory

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
   

}

```
🎁 Happy contributing! 🎁
