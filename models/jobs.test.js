"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./company.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "job1",
    salary: 10,
    equity: .01,
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'job1'`);
    expect(result.rows).toEqual([
      {
        title: "job1",
        salary: 10,
        equity: .01,
        company_handle: "c1",
      },
    ]);
  });

  // Note: We define jobs as a role that can be shared (Max and I are both
  // software-engineers at MaxInc getting paid the same etc...)
  // we are classified as Cjob = 1 and Mjob = 1 not Cjob = 1 Mjob = 2
  // Anyone can post the same post multiple times right now
  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "job1",
        salary: 10,
        equity: .01,
        company_handle: "c1",
      },
      {
        title: "job2",
        salary: 20,
        equity: .02,
        company_handle: "c1",
      },
      {
        title: "job3",
        salary: 30,
        equity: .03,
        company_handle: "c1",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds.testJobId1);
    expect(job).toEqual(
      {
        title: "job1",
        salary: 10,
        equity: .01,
        company_handle: "c1",
      }
    );
  });


  test("not found if no such job", async function () {
    try {
      await Job.get("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
      title: "new job1",
      salary: 500,
      equity: .5,
      company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.update(testJobIds.testJobId1, updateData);
    expect(job).toEqual({
      id: testJobIds.testJobId1,
      ...updateData,
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${testJobIds.testJobId1}`);
    expect(result.rows).toEqual([{
      title: "new job1",
      salary: 500,
      equity: .5,
      company_handle: "c1",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "new job1",
      salary: null,
      equity: null,
      company_handle: "c1",
    };

    let job= await Job.update(testJobIds.testJobId1, updateDataSetNulls);
    expect(job).toEqual({
      id: testJobIds.testJobId1,
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${testJobIds.testJobId1}`);
    expect(result.rows).toEqual([{
      name: "new job1",
      salary: null,
      equity: null,
      company_handle: "c1",
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update("nope", updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(testJobIds.testJobId1, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds.testJobId1);
    const res = await db.query(
        `SELECT id FROM jobs WHERE id=${testJobIds.testJobId1}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
