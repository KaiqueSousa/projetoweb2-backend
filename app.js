var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var dotenv = require("dotenv");
var swaggerJSDoc = require("swagger-jsdoc");
var swaggerUi = require("swagger-ui-express");
const cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/user");
var contatoRouter = require("./routes/contato");
var db = require("./config/db.config");

var app = express();
const port = process.env.PORT || 3001;
// config dotenv and sequelize
dotenv.config();
db.sync();

// swagger set up
var swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API REST Express de um gerenciador simples de contatos.",
    version: "1.0.0",
    description:
      "Esta é uma aplicação de API REST, que utiliza dados de uma agenda de contatos.",
    license: {
      name: "Licenciado sob GPL.",
      url: "",
    },
    contact: {
      name: "Antonia e Kaíque",
      url: "",
    },
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Development server",
    },
  ],
};
var options = {
  swaggerDefinition,
  apis: ["./routes/user.js", "./routes/contato.js"],
};
var swaggerSpec = swaggerJSDoc(options);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors("*"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/contato", contatoRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(port);

module.exports = app;
