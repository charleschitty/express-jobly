"use strict";

const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

// const jwt = require("jsonwebtoken");
// const { createToken } = require("./tokens");
// const { SECRET_KEY } = require("../config");

  /**
   * Tests to write:
   *  No input provided, or empty input provided
   *  No mapping object provided
   *
   * A working example (correct parameterized and col name mapping)
   *
   */

  describe("sqlForPartialUpdate", function(){

    test("works as intended", function(){
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
      try{
        sqlForPartialUpdate(dataToUpdate, jsToSql);
      }catch (err){
        expect(err instanceof BadRequestError).toBeTruthy();
      };
    });

    test("no mapping object provided", function () {
      const dataToUpdate = {firstName: 'Aliya', age: 32};
      try{
        sqlForPartialUpdate(dataToUpdate);
      }catch (err){
        console.log(err);
        expect(err instanceof TypeError).toBeTruthy();
      };
    });
  });