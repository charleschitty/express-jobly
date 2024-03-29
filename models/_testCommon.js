"use strict";

const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

let testJobIds = {};

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM jobs");

  await db.query(`
      INSERT INTO companies(handle, name, num_employees, description, logo_url)
      VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
             ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
             ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);

  await db.query(`
      INSERT INTO users(username,
                        password,
                        first_name,
                        last_name,
                        email)
      VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
             ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
      RETURNING username`, [
    await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
    await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
  ]);

  const testJobsResult = await db.query(`
    INSERT INTO jobs(title,salary,equity,company_handle)
    VALUES  ('j1', 10, .1, 'c1'),
            ('j2', 20, .2, 'c1'),
            ('j3', 30, .3, 'c1'),
            ('j4', 40, 0, 'c2')
    RETURNING id`); // j4 has no equity

  testJobIds.testJobId1 = testJobsResult.rows[0].id;
  testJobIds.testJobId2 = testJobsResult.rows[1].id;
  testJobIds.testJobId3 = testJobsResult.rows[2].id;
  testJobIds.testJobId4 = testJobsResult.rows[3].id;

};

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
};