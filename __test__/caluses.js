
import assert from 'assert';
import { products, users } from '../data.js';
import { runSQL, buildDbEnv, JOIN } from '../index.js';
import { fromClauseToJs2, resolveTableName } from '../lib/sqlExpr.js';



export default (env) => {
    const debug = true;
    let tableObj = {
        "db": null,
        "table": "orders",
        "as": null
    }
    assert.strictEqual(resolveTableName(tableObj), 'orders');
    tableObj = {
        "db": null,
        "table": "orders",
        "as": 'a'
    }
    assert.strictEqual(resolveTableName(tableObj), 'a')
    let fromList = [
        {
            "db": null,
            "table": "orders",
            "as": null
        }]
    assert.deepStrictEqual(fromClauseToJs2(fromList), `context.tables['orders']`)
    fromList = [
        {
            "db": null,
            "table": "orders",
            "as": null
        },
        {
            "db": null,
            "table": "payments",
            "as": null,
            "join": "INNER JOIN",
            "on": {
                "type": "binary_expr",
                "operator": "=",
                "left": {
                    "type": "column_ref",
                    "table": "payments",
                    "column": "order_id"
                },
                "right": {
                    "type": "column_ref",
                    "table": "orders",
                    "column": "id"
                }
            }
        }
    ]
    assert.deepStrictEqual(fromClauseToJs2(fromList), `JOIN(context.tables['orders'],context.tables['payments'],${JSON.stringify({
        "db": null,
        "table": "payments",
        "as": null,
        "join": "INNER JOIN",
        "on": {
            "type": "binary_expr",
            "operator": "=",
            "left": {
                "type": "column_ref",
                "table": "payments",
                "column": "order_id"
            },
            "right": {
                "type": "column_ref",
                "table": "orders",
                "column": "id"
            }
        }
    },null,1)})`)
    fromList = [
        {
            "db": null,
            "table": "orders",
            "as": null
        },
        {
            "db": null,
            "table": "payments",
            "as": null,
            "join": "INNER JOIN",
            "on": {
                "type": "binary_expr",
                "operator": "=",
                "left": {
                    "type": "column_ref",
                    "table": "payments",
                    "column": "order_id"
                },
                "right": {
                    "type": "column_ref",
                    "table": "orders",
                    "column": "id"
                }
            }
        },
        {
            "db": null,
            "table": "users",
            "as": null,
            "join": "INNER JOIN",
            "on": {
                "type": "binary_expr",
                "operator": "=",
                "left": {
                    "type": "column_ref",
                    "table": "orders",
                    "column": "user_id"
                },
                "right": {
                    "type": "column_ref",
                    "table": "users",
                    "column": "id"
                }
            }
        }
    ]
    assert.deepStrictEqual(fromClauseToJs2(fromList), `JOIN(JOIN(context.tables['orders'],context.tables['payments'],${JSON.stringify({
        "db": null,
        "table": "payments",
        "as": null,
        "join": "INNER JOIN",
        "on": {
            "type": "binary_expr",
            "operator": "=",
            "left": {
                "type": "column_ref",
                "table": "payments",
                "column": "order_id"
            },
            "right": {
                "type": "column_ref",
                "table": "orders",
                "column": "id"
            }
        }
    },null,1)}),context.tables['users'],${JSON.stringify({
        "db": null,
        "table": "users",
        "as": null,
        "join": "INNER JOIN",
        "on": {
            "type": "binary_expr",
            "operator": "=",
            "left": {
                "type": "column_ref",
                "table": "orders",
                "column": "user_id"
            },
            "right": {
                "type": "column_ref",
                "table": "users",
                "column": "id"
            }
        }
    },null,1)})`)

}


