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
        window } = selectStmtObj;
    // where&&console.log(whereClauseToJs(where));
    // console.log(columns)
    //   console.log('=====',groupby,groupby&& croupByClauseToJs(groupby))
    // let aggr_func = columns.filter((_)=>{return _.expr.type==='aggr_func'})
    const _group_col_name = groupby ? groupby.map((item) => `${exprToJs(item, '')}`).join('_') : '';
    let js_string = `${groupby ? `Object.values(` : ''}${fromClauseToJs(from)}${where ? `.filter(${whereClauseToJs(where)})` : ''
        }${groupby ? `${croupByClauseToJs(groupby)}` : ''}${limit ? `.slice(0,${limit.value[0].value})` : ''
        }.map((row,index,table) => {
  
        let select_columns = ${JSON.stringify(selectColumnListToJs(columns,))};
        let agg_logic_map = {
            ${(Array.isArray(columns) ?
            columns.filter(_ => { return _.expr.type === 'aggr_func' }).reduce((agg_logic_map, item, index, array) => {
                agg_logic_map += `'${selectColumnToJs(item)}':${aggFuncToSql(item.expr.name, item.expr.args, `row[row['${_group_col_name}']]`, groupby)} ${array.length - 1 === index ? '' : ','}`
                return agg_logic_map
            }, '') : '')}};

        // console.log('[map aggr_func called]', agg_logic_map)  
        let new_row = select_columns.length ? {} : row;
        select_columns.forEach((column,index )=> {
            if (column in row) {
                new_row[column] = row[column];
            }else{
                new_row[column] = agg_logic_map[column]?agg_logic_map[column]:(_)=>_;
                
            }
        });
        return new_row;
    })`;


    return js_string.split('  ').join(' ');

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
}).filter(_ => _)
      `
}
function selectColumnListToJs(selectColumnList = []) {
    if (selectColumnList === '*') return [];
    let columns = selectColumnList.map((_) => selectColumnToJs(_));
    // console.log(columns);
    return columns
}
function selectColumnToJs(columnObj = {}) {
    const { expr, as } = columnObj;
    let js_string = '';
    // console.log(expr)
    if (expr.type === 'aggr_func') {
        js_string = `${expr.name}(${exprToJs(expr.args.expr)})`
    } else { js_string = exprToJs(expr); }
    // console.log(js_string)
    return js_string;
}
function fromClauseToJs(fromClause = []) {
    const { db, table, as } = fromClause[0];

    return `context.tables['${db ? db + '.' : ''}${table}']`;
}
function whereClauseToJs(whereClause = {}) {
    return `(row) => {
        return ${exprToJs(whereClause, 'row.')}
    }`
}
function exprToJs(exprOrigin, row = '', table_data = []) {
    // console.log(exprOrigin)
    const { left, right, type, operator, value, expr, args, parentheses, table, column, name } = exprOrigin;
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
                        // console.log(item)
                        for (let column in item){
                            let col_value =item[column];
                            // console.log(${exprToJs(left, row)}, '${operator}', col_value  ,false)
                            if(${exprToJs(left, row)} ${operator} col_value  ===false){
                            //    console.log(row);
                               result = false
                               break;
                            }
                        }
                        return result})`;
                } else
                    js_string = `${exprToJs(left, row)} ${sqlOperatorTOJs(operator)} ${exprToJs(right, row)}`;

            }

            break;
        case 'column_ref':
            {
                // console.log(table, row)
                let _table = '';
                if (table) {
                    if (!row) {
                        _table = `${table}.`
                    }
                }

                js_string = `${_table}${row}${column}`;
                // console.log(js_string,)
            }
            break;
        case 'aggr_func':
            {
                // console.log(table, row)
                // let _table = '';
                // if (table) {
                //     if (!row) {
                //         _table = `${table}.`
                //     }
                // }

                js_string = aggFuncToSql(name, args, table_data);
                // console.log(js_string,)
            }
            break;


        default:
            break;
    }
    return js_string;
}
function aggFuncToSql(name, args, table_name = '', groupby = []) {
    const { expr } = args;
    let js_String = ''
    // console.log('==========================================', table_name)
    // const _ = [groupby.map((item) => `${exprToJs(item, '')}`)].join('_')
    js_String = `${name}('${exprToJs(expr)}', ${table_name})`


    return js_String;
}
// function sumTOJs(column, table_name) {
//     // console.log(column)
//     return `SUM('${column}',${table_name})            `;
//     return `${table_name}.map((row)=>{
//         let acc =reduce((acc,item)=>{
//             acc.sum+=item[${column}];
//             acc.count++;
//             return acc;
//         },{count:0,sum:0})
//             })
//             `
// }
// function avgToJs(column, table_name) {
//     return `AVG('${column}',${table_name})`
//     return `\n.map((row)=>{
// let acc =reduce((acc,item)=>{
//     acc.avg+=item[${column}];
//     acc.count++;
//     return acc;
// },{count:0,avg:0})
//     })
//     `
// }
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
export {
    exprToJs
}