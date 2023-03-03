
import ASTModule from 'node-sql-parser';
import { products, users } from './data.js';
import { exprToJs } from './lib/sqlExpr.js';
import { ilikeToRegExp } from './lib/sqlLike.js';
const parser = new ASTModule.Parser()

// opt is optional
/**
 * 
 * @param {*} tables { identifier: string, table: [] }
 * @param {*} functions { identifier: string, logic: () => { } }
 * @returns 
 */
function buildDbEnv(
    // statement = [{ type: 'select', logic: () => { } }],
    tables = [{ identifier: '', table: [] }],
    functions = [{ identifier: '', logic: () => { } }],
) {

    let context = { tables: {}, functions: {} };


    // statement.forEach(statement => {
    //     const { type, logic } = statement;
    //     context.statements[type] = logic;
    // });

    tables.forEach(table_obj => {
        const { identifier, table } = table_obj;
        context.tables[identifier] = table;
    });

    functions.forEach(func => {
        const { identifier, logic } = func;
        context.functions[identifier] = logic
    })

    return context;

}


function executeAst(ast = {}, dbContext) {
    let result = [];

    result = executeStatement(ast, dbContext)
    return result;

}

function executeStatement(ast, dbContext = {}, debug = false) {
    let js_string = exprToJs(ast);
    const context = dbContext;
    // console.log(context.tables)
    if (debug) {
        console.log(js_string);
        // console.log(JSON.stringify(ast, null, 2))
    }
    return eval(js_string);
}

function SUM(distinct, column = '', table = [], group_by = '') {

    // console.log('[sum aggr_func called]=====',column,group_by,table)
    // console.log(table[group_by],)
    return table.reduce((acc, item) => {
        acc.sum += item[column];
        return acc;
    }, { count: 0, sum: 0 })?.sum || 0;
}
function AVG(distinct, column = '', table = []) {
    console.log('[AVG aggr_func called]=====', distinct)
    return table.reduce((acc, item, index, array) => {

        if (distinct) {
            delete acc.count;
            delete acc.avg;
            if (!acc[item[column]]) {
                acc[item[column]] = 1;
            }
            // console.log(acc,);

            acc[item[column]]++;

            if (index === array.length - 1) {
                let count = 0;
                let sum = 0;
                for (const key in acc) {
                    if (Object.hasOwnProperty.call(acc, key)) {
                        const element = acc[key];
                        count++;
                        sum += element;
                    }
                }
                acc.avg = sum / count;
            }
        } else {
            acc.avg += item[column];
        }
        if (index === array.length - 1) {
            acc.avg = acc.avg / array.length;
        }
        return acc;
    }, { count: 0, avg: 0 })
        ?.avg || 0;
}
function COUNT(distinct, column = '', table = []) {
    // console.log('[sum aggr_func called]=====', column, distinct, table)
    return table.reduce((acc, item, index, array) => {

        acc.count++
        if (distinct) {
            delete acc.count;
            delete acc.avg;
            if (!acc[item[column]]) {
                acc[item[column]] = 1;
            }
            // console.log(acc,);

            acc[item[column]]++;

            if (index === array.length - 1) {
                let count = 0;
                for (const key in acc) {
                    if (Object.hasOwnProperty.call(acc, key)) {
                        const element = acc[key];
                        count++;
                    }
                }
                acc.count = count;
            }
        }
        // console.log(acc)
        return acc;
    }, { count: 0, avg: 0 })
        ?.count || 0;
}
function MAX(distinct, column = '', table = []) {
    // console.log('[sum aggr_func called]=====',column,table)
    return table.reduce((max, item, index, array) => {

        if (item[column] > max) max = item[column];

        return max;
    }, 0) || 0;
}
function MIN(distinct, column = '', table = []) {
    // console.log('[sum aggr_func called]=====',column,table)
    return table.reduce((max, item, index, array) => {

        if (item[column] < max) max = item[column];

        return max;
    }, Infinity) || 0;
}

// function genSelectStatement(ast) { return selectToJs(ast) }
const opt = {
    database: 'MariaDB' // MySQL is the default database
}




/**
 * 
 * @param {*} SQL SQL string
 * @param {*} env env obj return from buildDbEnv()
 * @param {*} debug if set true will log generated js code
 * @returns 
 */
function runSQL(SQL, env, debug = false) {
    if (debug) {
        console.log('\n==============================================')
        console.log(SQL)
    }
    console.log('\n')
    const { tableList, columnList, ast } = parser.parse(SQL, opt);
    // console.log(JSON.stringify(ast,null,2))
    return executeStatement(ast, env, debug)
}

export {
    buildDbEnv,
    runSQL
}