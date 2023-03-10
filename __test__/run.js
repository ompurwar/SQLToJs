import { orders, payments, products, users } from '../data.js';
import { buildDbEnv } from '../index.js';
import select from './select.js'
import clauses from './caluses.js';
import remoteData from './remoteData.js';

const tables = [
    { identifier: 'products', table: products },

    { identifier: 'users', table: users },
    { identifier: 'orders', table: orders },
    { identifier: 'payments', table: payments },
]
const functions = [];


const tests = [
    clauses,
    select,
    remoteData,
];

const env = buildDbEnv(tables, functions);

tests.forEach(test => test(env));

console.log('All assertions passed!');