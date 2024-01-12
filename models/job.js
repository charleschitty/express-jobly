"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for jobs */

//TODO: currently no IDS returned

class Job{

  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {
    console.log("ARE WE ALIVE OR WHAT!!?!?!?!?!?")
   // debugger;
    const result = await db.query(`
                INSERT INTO jobs (title,
                                  salary,
                                  equity,
                                  company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING
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
  static async findAll(filters){

  }
  /** return details on specific job
   *
   * auth: any
  */
  static async get(){

  }

  /** update a job in db
   *
   * auth : admin
  */
  static async update(){

  }

  /** remove a job from db
   *
   * auth : admin
  */
  static async remove(){

  }

}

module.exports = Job;
