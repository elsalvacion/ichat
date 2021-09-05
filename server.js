const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");

// config
const connectDB = require("./config/db");

// require and use config files
require("dotenv").config({ path: "./config/.env" });
// connectDB();

const app = express();

// external middlewares
app.use(mongoSanitize());
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(hpp());

// express body parser

app.use(express.json());

// static
app.use(express.static(__dirname + "/public"));

const PORT = process.env.PORT || 5000;
// listen to a port
app.listen(PORT, () =>
  console.log(
    `server up and running on ${process.env.NODE_ENV} MODE at ${PORT}`
  )
);
