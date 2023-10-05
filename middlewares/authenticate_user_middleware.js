const jsonwebtoken = require("jsonwebtoken");
const { promisify } = require("util");

const User = require("../models/user");

/** @type {import("express").RequestHandler} */
exports.authenticateUserMiddleware = async (req, res, next) => {
  try {
    let token = "";
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({
        status: "fail",
        error: "Unable to authorize the user",
      });
    }
    const decodedData = await promisify(jsonwebtoken.verify)(
      token,
      process.env.JWT_SECRET
    );
    const user = await User.findById(decodedData.id);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        error: "Unable to authorize the user",
      });
    }
    // check if the user has changed the password after the token was issued
    const isPasswordChanged = user.checkIfPasswordChanged(decodedData.iat);
    if (isPasswordChanged) {
      return res.status(401).json({
        status: "fail",
        error: "Unable to authorize the user",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      error: "Unable to authorize the user",
    });
  }
};
