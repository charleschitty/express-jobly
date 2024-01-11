"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const companyFiltersSchema = require("../schemas/companyFilters.json")

const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login (admin)
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  console.log("POST route to /companies/ reached");
  const validator = jsonschema.validate(
    req.body,
    companyNewSchema,
    {required: true}
  );


  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }
  const company = await Company.create(req.body);

  return res.status(201).json({ company });
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  console.log("GET route to /companies/ reached");

  //check if query exists in request
  if (Object.keys(req.query).length !== 0) {

    //Note: Express ignores mutation attempts of req.queries
    const query = { ...req.query };
    if (req.query.minEmployees){
      query.minEmployees = Number(req.query.minEmployees);
    };
    if (req.query.maxEmployees){
      query.maxEmployees = Number(req.query.maxEmployees);
    }

    //validate query matches schema
    const validator = jsonschema.validate(
      query,
      companyFiltersSchema,
      {required: true}
    );

    if (!validator.valid){
      const errs = validator.errors.map(err => err.stack);
      throw new BadRequestError(errs);
    }

    //schema is valid, pass query to Company method
    const { nameLike, minEmployees, maxEmployees } = req.query;
    const companies = await Company.findFiltered(
      {
        nameLike,
        minEmployees,
        maxEmployees
      });
    return res.json({ companies });
  }

  const companies = await Company.findAll();
  return res.json({ companies });
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  console.log(`GET route to /companies/${req.params.handle} reached`);
  const company = await Company.get(req.params.handle);
  return res.json({ company });
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login (admin)
 */

router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  console.log(`PATCH route to /companies/${req.params.handle} reached`);

  const body = { ...req.body };
  if (req.body.numEmployees){
    body.numEmployees = Number(req.body.numEmployees);
  };

  const validator = jsonschema.validate(
    body,
    companyUpdateSchema,
    {required:true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  };

  const company = await Company.update(req.params.handle, req.body);
  return res.json({ company });
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login (admin)
 */

router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  console.log(`DELETE route to /companies/${req.params.handle} reached`);

  await Company.remove(req.params.handle);
  return res.json({ deleted: req.params.handle });
});


module.exports = router;
