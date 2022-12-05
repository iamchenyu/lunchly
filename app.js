/** Express app for Lunchly. */

const express = require("express");
const nunjucks = require("nunjucks");
const routes = require("./routes");

const app = express();

// Parse body for urlencoded (non-JSON) data and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve static files in the pulic folder
app.use(express.static("public"));
app.use(routes);

nunjucks.configure("templates", {
  autoescape: true,
  express: app,
});

/** 404 handler */

app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.render("error.html", { err });
});

module.exports = app;
