"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "job1",
    salary: 10,
    equity: "0.01",
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);

    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number)
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'job1'`);
    expect(result.rows).toEqual([
      {
        id: job.id,
        title: "job1",
        salary: 10,
        equity: "0.01", //FIXME: note the string
        company_handle: "c1"
      },
    ]);
  });

  test("bad request with non-existent company", async function () {
    try {
      await Job.create({
        title: "new",
        salary: 10,
        equity: "0.01",
        companyHandle: "WRONG"
      })
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
  // Note: We define jobs as a role that can be shared (Max and I are both
  // software-engineers at MaxInc getting paid the same etc...)
  // we are classified as Cjob = 1 and Mjob = 1 not Cjob = 1 Mjob = 2
  // Anyone can post the same post multiple times right now
});

/************************************** findJobs (get all jobs) */

// describe("findJobs", function () {
//   test("works: no filter", async function () {
//     let jobs = await Job.findJobs();
//     expect(jobs).toEqual([
//       {
//         title: "job1",
//         salary: 10,
//         equity: .01,
//         company_handle: "c1",
//       },
//       {
//         title: "job2",
//         salary: 20,
//         equity: .02,
//         company_handle: "c1",
//       },
//       {
//         title: "job3",
//         salary: 30,
//         equity: .03,
//         company_handle: "c1",
//       },
//       {
//         title: "job4",
//         salary: 40,
//         equity: '0',
//         company_handle: "c2",
//       },
//     ]);
//   });

//   test("works: one filters", async function(){
//     const filter = { minSalary: 20 };

//     const response = await Job.findJobs(filter);
//     expect(response).toEqual([
//       {
//         title: "job2",
//         salary: 20,
//         equity: '.02',
//         company_handle: "c1",
//       },
//       {
//         title: "job3",
//         salary: 30,
//         equity:'.03',
//         company_handle: "c1",
//       },
//       {
//         title: "job4",
//         salary: 40,
//         equity: '0',
//         company_handle: "c2",
//       },
//     ]);
//   });



//   test("works: two filters", async function(){
//     const filter = { minSalary: 20, hasEquity: true };

//     const response = await Job.findJobs(filter);
//     expect(response).toEqual([
//       {
//         title: "job2",
//         salary: 20,
//         equity: .02,
//         company_handle: "c1",
//       },
//       {
//         title: "job3",
//         salary: 30,
//         equity: .03,
//         company_handle: "c1",
//       },
//     ]);
//   });

//   test("works: all filters", async function(){
//     const filter = { title: "job4", minSalary: 20, hasEquity: false };

//     const response = await Job.findJobs(filter);
//     expect(response).toEqual([
//       {
//         title: "job4",
//         salary: 40,
//         equity: '0',
//         company_handle: "c2",
//       },
//     ]);
//   });

//   test("no results", async function(){
//     const filter = { title: "job666"};
//     const response = await Job.findJobs(filter);
//     expect(Object.keys(response).length).toEqual(0);

//   })

//   test("error: minSalary is negative", async function(){
//     const filter = { minSalary: -20 };

//     expect(()=> Job.findJobs(filter))
//       .toThrow(BadRequestError);
//   })

//   test("error: equity is negative", async function(){
//     const filter = { equity: -20 };

//     expect(()=> Job.findJobs(filter))
//       .toThrow(BadRequestError);
//   })


//   test("non-existent filters", async function(){
//     const filter = { LeastFavCactus: 'garfield' };

//     const response = await Job.findJobs(filter);
//     expect(response).toEqual([
//       {
//         title: "job1",
//         salary: 10,
//         equity: '.01',
//         company_handle: "c1",
//       },
//       {
//         title: "job2",
//         salary: 20,
//         equity: '.02',
//         company_handle: "c1",
//       },
//       {
//         title: "job3",
//         salary: 30,
//         equity:'.03',
//         company_handle: "c1",
//       },
//       {
//         title: "job4",
//         salary: 40,
//         equity: '0',
//         company_handle: "c2",
//       },
//     ]);

//   })

// }); /** END DESCRIBE BLOCK */






/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds.testJobId1);
    expect(job).toEqual(
      {
        id: testJobIds.testJobId1,
        title: "j1",
        salary: 10,
        equity: "0.1",
        companyHandle: "c1"
      }
    );
  });


  test("bad request if invalid input", async function () {
    try {
      await Job.get("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      console.log(err);
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(141414);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      console.log(err);
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
      title: "new job1",
      salary: 500,
      equity: "0.5"
  };
  const badUpdateData = {
    title: "new job1",
    salary: 500,
    equity: "0.5",
    company_handle: "c2"
};


  test("works", async function () {
    //debugger;
    let job = await Job.update(testJobIds.testJobId1, updateData);
    expect(job).toEqual({
      ...updateData,
      companyHandle: "c1",
      id: testJobIds.testJobId1
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${testJobIds.testJobId1}`);
    expect(result.rows).toEqual([{
      title: "new job1",
      salary: 500,
      equity: "0.5",
      companyHandle: "c1",
      id: testJobIds.testJobId1
    }]);
  });


  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "new job1",
      salary: null,
      equity: null,
    };

    let job= await Job.update(testJobIds.testJobId1, updateDataSetNulls);
    expect(job).toEqual({
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

  test("fails if company handle attempted to update", async function () {
    try{
      await Job.update(testJobId1, badUpdateData);
      throw new Error("fail test, you shouldn't get here");
    }catch(err){
      expect(err instanceof BadRequestError).toBeTruthy();
    }
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

// /************************************** remove */

// describe("remove", function () {
//   test("works", async function () {
//     await Job.remove(testJobIds.testJobId1);
//     const res = await db.query(
//         `SELECT id FROM jobs WHERE id=${testJobIds.testJobId1}`);
//     expect(res.rows.length).toEqual(0);
//   });

//   test("not found if no such job", async function () {
//     try {
//       await Job.remove("nope");
//       throw new Error("fail test, you shouldn't get here");
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });
