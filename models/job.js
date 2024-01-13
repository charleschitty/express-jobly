"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for jobs */

//TODO: currently no IDS returned

class Job {

  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {

    const companyExists = await db.query(`
        SELECT handle
        FROM companies
        WHERE handle = $1`, [companyHandle]);

    if (!companyExists.rows[0]) {
      throw new BadRequestError(`No such company: ${companyHandle}`);
    };


    const result = await db.query(`
                INSERT INTO jobs (title,
                                  salary,
                                  equity,
                                  company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"`, [
      title,
      salary,
      equity,
      companyHandle,
    ],
    );
    const job = result.rows[0];

    return job;
  };

  /** Takes an object of params and constructs arrays for WHERE clause
   * and paramaterized query array for title, minSalary, hasEquity.
   *
   * Returns { whereString: "WHERE title ILIKE $1 ...", filterValues: ['c',...]}
   */

static _findFilteredSqlHelper(params){

  const paramsForSql = [];
  const filterValues  = [];
  let whereString;

  if(params.title){
    filterValues.push('%' + params.title + '%');
    paramsForSql.push(`title ILIKE $${filterValues.length}`)
  };
  if(params.minSalary){
    filterValues.push(params.minSalary);
    paramsForSql.push(`salary >= $${filterValues.length}`)
  };
  if(params.hasEquity === false){
    filterValues.push(0);
    paramsForSql.push(`equity = $${filterValues.length}`)
  };
  if(params.hasEquity === true){
    filterValues.push(0);
    paramsForSql.push(`equity > $${filterValues.length}`)
  };

  if (paramsForSql.length > 0){
    whereString = "WHERE  " + paramsForSql.join(" AND ");
  };

  return { whereString, filterValues }
};


  /** Find all companies (optional filters parameters may be provided)
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */
  static async findAll(filters) {
    let whereString;
    let filterValues;

    if (filters){
      console.log("*****I AM GETTING FILTERED **********");
      whereString, filterValues = this._findFilteredSqlHelper(params)
    };
    console.log("WHERE STRING:", whereString);
    console.log("FILTER VALUES:", filterValues);

    const jobsRes = await db.query(`
        SELECT id,
               title,
               salary,
               equity,
               company_handle AS "companyHandle"
        FROM jobs
        ${whereString}
        ORDER BY id, companyHandle`, filterValues); //TODO: why does company_handle fail
    return jobsRes.rows;
  };


  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    if (typeof id !== "number"){
      throw new BadRequestError(`Nod an id! Job id must be integer`)
    };

    const jobRes = await db.query(`
      SELECT id,
             title,
             salary,
             equity,
             company_handle AS "companyHandle"
      FROM jobs
      WHERE id = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  };


  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity }
   *
   * Returns {id, title, salary, equity, companyHandle}}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, updateData) {
    if(typeof id !== "number"){
      throw new BadRequestError(`Not an id! Job id must be integer`);
    };

    if (updateData.companyHandle){
      throw new BadRequestError("Cannot change company handle");
    };

    const { setCols, values} = sqlForPartialUpdate(
      updateData,
      {
        companyHandle : "company_handle"
      });

    const idVarIdx = "$" + (values.length + 1);
    const querySql = `
      UPDATE jobs
      SET ${setCols}
      WHERE id = ${idVarIdx}
      RETURNING
        id,
        title,
        salary,
        equity,
        company_handle AS "companyHandle"`;


    const result = await db.query(querySql, [... values, id]);

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No such job: ${id}`);

    return job;

  };

/** Delete given job from database; returns undefined.
 *
 * Throws NotFoundError if job not found.
 **/

  static async remove(id) {
    if (typeof id !== "number"){
      throw new BadRequestError(`Nod an id! Job id must be integer`)
    };

    const result = await db.query(`
      DELETE
      FROM jobs
      WHERE id = $1
      RETURNING id`,[id]);
    const job = result.rows[0];

    if(!job) throw new NotFoundError(`No job: ${id}`);
  };
};

module.exports = Job;
