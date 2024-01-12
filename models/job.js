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

  /** Get all jobs, optional filter paramaters may be provided
   *
   * auth: any
  */
  static async findAll(filters) {

  }
  /** return details on specific job
   *
   * auth: any
  */
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

  /** update a job in db
   *
   * auth : admin
  */
  static async update(id, updateData) {
    if(typeof id !== "number"){
      throw new BadRequestError(`Not an id! Job id must be integer`);
    }

    const { setCols, values} = sqlForPartialUpdate(
      updateData,
      {
        companyHandle : "company_handle"
      });

    const idVarIdx = "$" + (values.length + 1);
    //debugger;
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

    //debugger;
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No such job: ${id}`);

    return job;

  }

  /** remove a job from db
   *
   * auth : admin
  */
  static async remove() {

  }

}

module.exports = Job;
