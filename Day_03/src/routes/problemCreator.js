const express = require('express');
const problemRouter = express.Router();

// these three needs admin access
problemRouter.post("/create",createProblem);
problemRouter.patch("/:id",updateProblem);
problemRouter.delete("/:id",deleteProblem);

problemRouter.get("/:id",fetchProblem);
problemRouter.get("/",fetchAllProblem);
problemRouter.get("/user", solvedProblem);


module.exports = problemRouter;