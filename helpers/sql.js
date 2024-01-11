"use strict";

const { BadRequestError } = require("../expressError");

/**
 * Takes an object with values to update in the form { field : 'value' }, and
 * a jsToSql mapping object in the form: { jsColName : "sql_col_name" }
 *
 * Maps javascript variable names to SQL column names, and assign parameters
 * in order to sanitize the inputs (create parameterized query).
 *
 * Column names not present in jsToSql are included in the output with their
 * original names.
 *
 * Example input:
 *
 * {column1: val1, column2: val2, }, {column1: column_1, column2 : column_2}
 *
 * Returns:
 *
 * {  setCols: '"column_1"=$1, "column_2"=$2',
 *    values: [val1, val2, ...]
 *
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


module.exports = { sqlForPartialUpdate };
