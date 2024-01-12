"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for jobs */

class Job{

  /**
   *  create, update, delete, view jobs in database table jobs
   *
   */


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

  /** create a new job
   *
   * auth : admin
  */
  static async create(){

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
