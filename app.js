const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const tourRoutes = require("./routes/tour_routes");
const authRoutes = require("./routes/auth_routes");
const userRoutes = require("./routes/user_routes");
const reviewRoutes = require("./routes/reviews_routes");

dotenv.config({ path: "./.env" });

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// middleware to add requestTime in the req object
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// connecting to mongoDB
mongoose
  .connect(process.env.DATABASE_URL)
  .then((connection) => {
    console.log("Connected to database successfully");
    // console.log(connection);
  })
  .catch((err) => {
    console.log("Error connecting to the database");
    console.log(err);
  });

// app routes
app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reviews", reviewRoutes);

// route not found middleware
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `route ${req.url} not found`,
  });
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`app is up and running at port: ${process.env.PORT}`);
});
