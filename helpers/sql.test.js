"use strict";

const { BadRequestError, TypeError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

// const jwt = require("jsonwebtoken");
// const { createToken } = require("./tokens");
// const { SECRET_KEY } = require("../config");

// describe("createToken", function () {
//   test("works: not admin", function () {
//     const token = createToken({ username: "test", is_admin: false });
//     const payload = jwt.verify(token, SECRET_KEY);
//     expect(payload).toEqual({
//       iat: expect.any(Number),
//       username: "test",
//       isAdmin: false,
//     });
//   });

  /**
   * Tests to write:
   *  No input provided, or empty input provided
   *  No mapping object provided
   *
   * A working example (correct parameterized and col name mapping)
   *
   */

  describe("sqlForPartialUpdate", function(){

    test("works like a charm", function(){
      const dataToUpdate = {firstName: 'Aliya', age: 32};
      const jsToSql = {firstName: "first_name"}

      const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

      expect(result).toEqual({
        setCols:'"first_name"=$1, "age"=$2',
        values: ['Aliya', 32]
      });
    });

    test("no data to update provided", function () {
      const dataToUpdate = {};
      const jsToSql = {firstName: "first_name"}

      expect(sqlForPartialUpdate(dataToUpdate, jsToSql)).toThrow(BadRequestError)
    });

    // test("no mapping object provided", function () {
    //   const dataToUpdate = {firstName: 'Aliya', age: 32};
    //   try{
    //     sqlForPartialUpdate(dataToUpdate);
    //   }catch (err){
    //     expect(err instanceof TypeError).toBeTruthy();
    //   };
    // });
  });