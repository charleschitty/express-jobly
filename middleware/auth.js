"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      /* ignore invalid tokens (but don't store user!) */
    }
  }
  return next();

}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (res.locals.user?.username) return next();
  throw new UnauthorizedError();
}

/** Middleware to use when they must be an admin.
 *
 * If not, raises Unauthorized. */

//FIXME: added res.locals.user?.username (check if user exists b4 admin check)
function ensureAdmin(req, res, next) {
  if (res.locals.user?.username && res.locals.user?.isAdmin === true){

   return next();
  }
  throw new UnauthorizedError();
}

/** Middleware to use when they must be an admin or a specific user.
 *
 * If not, raises Unauthorized. */

function ensureAdminOrSameUser(req,res,next){
  const currentUsername = res.locals.user?.username;
  const viewedUsername = req.params.username;

  //FIXME:failing first here vs everywhere else we are not
  // security --> fail always unless specific credentials
  //if(res.locals.user?.isAdmin === true)...
  //if(currentUsername && (currentUsername === viewedUsername))

  if(res.locals.user?.isAdmin !== true){

    if(!currentUsername || (currentUsername !== viewedUsername)){
      throw new UnauthorizedError('Not authorized to view this user');
    };
  };

  return next();
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureAdminOrSameUser
};
