"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(`
        SELECT handle
        FROM companies
        WHERE handle = $1`, [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(`
                INSERT INTO companies (handle,
                                       name,
                                       description,
                                       num_employees,
                                       logo_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"`, [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */


  static async findAll() {
    const companiesRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        ORDER BY name`);
    return companiesRes.rows;
  }

  // UPDATE TO ACCEPT OPTIONAL FILTERING
  // create a company schema to address optional fields ?***
  // adjust the sql query based on the optional fields
  // ROUTE >> needs to have a conditional based on optional params
  //

  /**
   * Takes an object containing optional filters for the companies query
   * {"nameLike", minEmployees, maxEmployees}
   *
   * Returns matching rows (companies) that meet the filter criteria
   * [{company1}, {company2}, ...]
   *
   * TODO: should we use sqlPartialUpdate func from helpers for this?
   */

  static async findFiltered(params) {
    if (params.minEmployees && params.maxEmployees) {
      if (params.minEmployees > params.maxEmployees) {
        throw new BadRequestError('Min cannot be greater than max');
      };
    };

    //map params to shape we need for SQL query
    const jsToSql = { nameLike: "name ILIKE $",
                      minEmployees: "numEmployees >= $",
                      maxEmployees: "numEmployees <= $"
                    }

    // WHAT WE WANT: params run through ^ that mapping
    // put those mapped values into an array, join it to create our string
    // append that string to WHERE clause

    // For every param we got, push the mapped valued into paramsForSql
    const paramsForSql = [];
    // for (const p in params){
    //   if(jsToSql[p]){
    //     paramsForSql.push(params[p]);
    //   }
    // }

    // add % for nameLike and add other params to our parameterized array
    const filterValues  = []
    if(params.nameLike){
      filterValues.push('%' + params.nameLike + '%');
      paramsForSql.push(`name ILIKE $${filterValues.length}`)
    }
    if(params.minEmployees){
      filterValues.push(params.minEmployees);
      paramsForSql.push(`numEmployees >= $${filterValues.length}`)
    }
    if(params.maxEmployees){
      filterValues.push(params.maxEmployees);
      paramsForSql.push(`numEmployees <= $${filterValues.length}`)
    }

    for (let i = 0; i < filterValues.length; i++){
      paramsForSql[i] += `${i+1}`
    }

    const whereString = paramsForSql.join(" AND ");

    console.log("WHERE STRING",whereString)

    const companiesRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees,
               logo_url
        FROM companies
        WHERE ${whereString}`,
        filterValues
      );

      return companiesRes.rows;
  }



  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        WHERE handle = $1`, [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE companies
        SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING
            handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(`
        DELETE
        FROM companies
        WHERE handle = $1
        RETURNING handle`, [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
