import { ilikeToRegExp } from "./sqlLike.js";

function selectToJs(selectStmtObj) {
    const {
        columns,
        into,
        from,
        where,
        groupby,
        having,
        orderby,
        limit,
        locking_read,
        distinct,
        window, expr } = selectStmtObj;
    // if (expr) ret selectToJs(expr.ast);
    // console.log(orderby)
    const is_only_select_star = !Array.isArray(columns);
    const agg_functions = is_only_select_star === false ? columns.filter(_ => { return _.expr.type === 'aggr_func' }) : [];
    const _group_col_name = groupby ? groupby.map((item) => `${exprToJs(item, '')}`).join('_') : '';

    let js_string = `${groupby ? `Object.values(` : ''}${fromClauseToJs(from)}${where ? `.filter(${whereClauseToJs(where)})` : ''
        }${groupby ? `${croupByClauseToJs(groupby)}` : ''}${limit ? `.slice(0,${limit.value[0].value})` : ''
        }.map((row,index,table) => {
  
        const select_columns = ${JSON.stringify(selectColumnListToJs(columns,))};
        const col_to_alias_map = ${!is_only_select_star? JSON.stringify(columnToAliasMap(columns)):'{}'};
        const is_group_by = ${!!groupby};
        const is_aggr_happening = ${agg_functions.length > 0}
        const should_prevent_futile_computation = is_aggr_happening && !is_group_by && index > 0; 
        
        if(should_prevent_futile_computation)return undefined; // reducing unnecessary computation
        
        let agg_logic_map = {${(is_only_select_star === false ?
            agg_functions.reduce((agg_logic_map,
                item,
                index,
                array) => {
                agg_logic_map +=
                    `'${selectColumnToJs(item)}':${aggFuncToSql(
                        item.expr.name,
                        item.expr.args,
                        tableNameForAggrFunc(_group_col_name),
                        groupby,
                        item.expr.args.distinct)} ${array.length - 1 === index ? '' : ','}`
                return agg_logic_map
            }, '') : '')}};
        let new_row = select_columns.length && !select_columns.includes('*') ? {} : row;
        !select_columns.includes('*') && select_columns.forEach((column,index )=> {
            let column_name_str = col_to_alias_map[column]||column;
            let column_name = column_name_str.split('.');
            column_name =column_name[column_name.length-1];
            let final_col_names =[column_name,column_name_str,column].filter((_)=>!(_ in new_row));
            if (column in row) {
            //    console.log(column,column_name_str,column_name)
            //    console.log( final_col_names)
                if(!new_row.hasOwnProperty(column_name)){
                    new_row[final_col_names[0]] = row[column];
                }else{
                    new_row[final_col_names[0]] = row[column];

                }
            }else{
                new_row[column_name] = agg_logic_map[column]?agg_logic_map[column]:[];   
            }
        });
        return new_row;
    }).filter(_=>_)
      ${distinct ? ` .reduce((acc,item,index,arr)=>{
        let selected_column_value = JSON.stringify(acc.selected_columns.reduce((acc,_)=>{
            acc[_] = item[_];
            return acc;
        },{}));

        if(!acc.counted[selected_column_value]){
            acc.data.push(item);
            acc.counted[selected_column_value]=true
        }

        return acc;
      },{data:[],counted:{}, selected_columns : ${JSON.stringify(selectColumnListToJs(columns,))}}).data` : ''}
      ${groupby && having ? `.filter(${heavingClauseToJs(having)})` : ''}
      ${orderby ? `.map(_=>({..._})).sort((a, b) => {

        ${orderby.reduce((acc, { expr, type }, index, array) => {
                acc += `
            if (a['${exprToJs(expr)}'] ${type === 'DESC' ? '>' : '<'} b['${exprToJs(expr)}']) return -1; 
            if (a['${exprToJs(expr)}'] ${type === 'DESC' ? '<' : '>'} b['${exprToJs(expr)}']) return 1;  
            `
                return acc;
            }, '')}
        return 0; // objects have the same order
      });`: ''}`;


    return js_string.split('  ').join(' ');


}
function columnToAliasMap(ast_column_list = []) {

    let map = {};

    ast_column_list.forEach(({ expr, as }) => {
        let column_name = selectColumnToJs({expr}); // wrapping in empty_object adapter pattern
        if (!map.hasOwnProperty(column_name)) {
            map[column_name] = as;
        }
    })
    return map;

}
function tableNameForAggrFunc(_group_col_name = '') {
    let table_name = `${_group_col_name ? `row[row['${_group_col_name}']]` : 'table'}`
    return table_name
}

function croupByClauseToJs(columnList = []) {
    // console.log(columnList, columnList.map(exprToJs), exprToJs(columnList[0]))
    let column_list = `[${columnList.map((item) => `'${exprToJs(item, '')}'`)}]`;
    return `.reduce((result, item) => {
    let column_list = ${column_list}.map(_ => item[_]);
    const key = column_list.join('_');
    if (!result[key]) {
        result[key] = [];
    }
    result[key].push(item);
    return result;
    }, {})).map(_ => {
        let obj = null;
        if (_.length) {
            obj = { ..._[0] };
            obj[${column_list}.map(_ => obj[_]).join('_')] = _
        }
        return obj;
    }).filter(_ => _)`
}
function selectColumnListToJs(selectColumnList = []) {
    if (selectColumnList === '*') return ['*'];
    let columns = selectColumnList.map((_) => selectColumnToJs(_));
    // console.log(columns);
    return columns
}
function selectColumnToJs(columnObj = {}, row = '') {
    const { expr, as } = columnObj;
    let js_string = '';

    if (expr.type === 'aggr_func') {
        js_string = `${expr.name}(${expr.args.distinct ? `${expr.args.distinct} ` : ''}${exprToJs(expr.args.expr)})`
    } else {
        js_string = exprToJs(expr, row);
    }

    return js_string;
}
// function fromClauseToJs(fromClause = []) {
//     const { db, table, as, expr } = fromClause[0];
//     if (expr && expr.ast) return selectToJs(expr.ast);
//     return `context.tables['${db ? db + '.' : ''}${table}']`;
// }
function fromClauseToJs(fromList = []) {
    let js_String = ''
    if (fromList.length === 1) {
        const { db, table, as, expr } = fromList[0];
        if (expr && expr.ast) return selectToJs(expr.ast);
        js_String = `context.tables['${db ? db + '.' : ''}${table}']`;
    }
    if (fromList.length > 1) {
        const last_table = fromList.slice(fromList.length - 1, fromList.length);
        const preceedingTables = fromList.slice(0, fromList.length - 1);
        // console.log(last_table)
        const condition = last_table.on
        js_String = `JOIN(${fromClauseToJs2(preceedingTables)},${fromClauseToJs2(last_table)},${JSON.stringify(last_table[0], null, 1)})`
    }


    return js_String;
}
function whereClauseToJs(whereClause = {}) {
    return `(row) => {
        return ${exprToJs(whereClause, 'row.')}
    }`
}
function heavingClauseToJs(heaving = {}) {
    return `(row,index,table) => {
        return ${exprToJs(heaving, 'row', '', true)}
    }`
}

function exprToJs(exprOrigin, row = '', table_name = '', heaving = false) {
    // console.log(exprOrigin)
    const { left, right, type, operator, value, expr, args, parentheses, table, column, name, as } = exprOrigin;
    let js_string = '';

    switch (type) {
        case 'select':
            js_string = selectToJs(exprOrigin)
            break;
        case 'function':
            js_string = sqlFunctionToJs(name, args)

            break;
        case 'number':
            js_string = `${Number(value)}`;
            break;
        case 'string':
            js_string = `'${String(value)}'`;
            break;
        case 'single_quote_string':
            js_string = `'${String(value)}'`;
            break;
        case 'unary_expr':
            {
                js_string = `${sqlOperatorTOJs(operator)} ${exprToJs(expr)}`;
            }

            break;
        case 'expr_list':
            {
                js_string = `[${value.map(exprToJs).join(',')}]`
            }

            break;

        case 'binary_expr':
            {

                if (operator === 'IN') {
                    js_string = `${exprToJs(right)}.includes(${exprToJs(left, row)})`
                } else if (operator === 'BETWEEN') {
                    let values = exprToJs(right);
                    js_string = `${exprToJs(left, row)} >= ${values}[0] \n&& ${exprToJs(left, row)} < ${values}[1]`;
                } else if (operator === 'LIKE') {
                    // console.log(exprToJs(right, row), exprToJs(left, row))
                    js_string = `ilikeToRegExp(${exprToJs(right)}).test(${exprToJs(left, row)})`
                } else if (['=', '<', '>'].includes(operator) && right.type === 'function' && right.name === 'ALL') {

                    js_string = `${exprToJs(right, row)}\n.every((item)=>{
                        let result = true;
                        for (let column in item){
                            let col_value =item[column];
                            if(${exprToJs(left, row, table_name, heaving)} ${operator} col_value  ===false){
                               result = false
                               break;
                            }
                        }
                        return result})`;
                } else
                    js_string = `${exprToJs(left, row, table_name, heaving)} ${sqlOperatorTOJs(operator)} ${exprToJs(right, row, table_name, heaving)}`;

            }

            break;
        case 'column_ref':
            {

                let _table = '';
                if (table) {
                    if (!row) {
                        _table = `${table}.`
                    }
                }

                js_string = `${_table}${row}${column}`;

            }
            break;
        case 'aggr_func':
            {

                // console.log(table_name)
                js_string = aggFuncToSql(name, args, table_name, undefined, undefined, heaving, row);

            }
            break;
        case 'star':
            {
                js_string = value;

            }
            break;


        default:
            break;
    }
    return js_string;
}


function aggFuncToSql(name, args, table_name = '', groupby = [], distinct, heaving = false, row = '') {
    const { expr } = args;
    let js_String = ''

    js_String = `${name}(${distinct ? `'${distinct.toString()}'` : undefined},'${exprToJs(expr)}', ${table_name})`;
    if (heaving) js_String = `${row}['${name}(${exprToJs(expr)})']`;
    // console.log(js_String, table_name,heaving)
    return js_String;
}

function sqlFunctionToJs(name, args) {
    // console.log(name,args)oo
    let js_String = '';
    switch (name) {
        case 'ALL':
            js_String = `${exprToJs(args.value[0].ast)}`
            // console.log(args.value[0].ast.columns, js_String, '=======ALL===========');
            break;

        default:
            break;
    }
    return js_String;
}
function sqlOperatorTOJs(operator) {
    let result = operator;
    switch (operator) {
        case '=':
            result = '==='
            break;
        case 'OR':
            result = '||'
            break;

        case 'AND':
            result = '&&'
            break;

        case 'NOT':
            result = '!'
            break;





        // ANY	 
        // EXISTS	
        // SOME
        default:
            break;
    }
    return result;
}
function fromClauseToJs2(fromList = []) {
    let js_String = ''
    if (fromList.length === 1) {
        const { db, table, as, expr } = fromList[0];
        if (expr && expr.ast) return selectToJs(expr.ast);
        js_String = `context.tables['${db ? db + '.' : ''}${table}']`;
    }
    if (fromList.length > 1) {
        const last_table = fromList.slice(fromList.length - 1, fromList.length);
        const preceedingTables = fromList.slice(0, fromList.length - 1);
        // console.log(last_table)
        const condition = last_table.on
        js_String = `JOIN(${fromClauseToJs2(preceedingTables)},${fromClauseToJs2(last_table)},${JSON.stringify(last_table[0], null, 1)})`
    }

    return js_String;
}
function resolveTableName(tableAstObj = {}) {
    const { table, as } = tableAstObj;
    if (as) return as;
    if (!as && table) return table;
    if (!as && !table) throw Error(`table name or aliasing is required ${JSON.stringify(table)}`)
}
export {
    exprToJs, sqlOperatorTOJs, fromClauseToJs2, resolveTableName
}

// JOIN(
//     JOIN(context.tables['orders'],
//         context.tables['payments'],
//         {
//             "db": null,
//             "table": "payments",
//             "as": null,
//             "join": "INNER JOIN",
//             "on": {
//                 "type": "binary_expr",
//                 "operator": "=",
//                 "left": {
//                     "type": "column_ref",
//                     "table": "payments",
//                     "column": "order_id"
//                 },
//                 "right": {
//                     "type": "column_ref",
//                     "table": "orders",
//                     "column": "id"
//                 }
//             }
//         }
//     ),

//     context.tables['users'],

//     {
//         "db": null,
//         "table": "users",
//         "as": null,
//         "join": "INNER JOIN",
//         "on": {
//             "type": "binary_expr",
//             "operator": "=",
//             "left": {
//                 "type": "column_ref",
//                 "table": "orders",
//                 "column": "user_id"
//             },
//             "right": {
//                 "type": "column_ref",
//                 "table": "users",
//                 "column": "id"
//             }
//         }
//     }
// )