const User = require("../models/user");
const jwtHelper = require("../utils/jwt_helper");

/** @type {import("express").RequestHandler} */
const signup = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    if (!newUser) {
      return res.status(400).json({
        status: "fail",
        message: "unable to register the user",
      });
    }
    const jwtPayload = {
      email: newUser.email,
      id: newUser._id,
    };
    const token = jwtHelper.generateJwtToken(jwtPayload);
    if (!token) {
      return res.status(400).json({
        status: "fail",
        message: "unable to register the user",
      });
    }
    res.status(201).json({
      status: "success",
      message: "user registered successfully",
      token,
      data: newUser,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "unable to register the user",
    });
  }
};

/** @type {import("express").RequestHandler} */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        status: "fail",
        message: "Please provide correct credentials",
      });
    }
    // using select() and passing +password since by default the value
    // of select for password is false and here we want to access the
    // password of the user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Please provide correct credentials",
      });
    }
    const isPasswordMatch = await user.comparePassword(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        status: "fail",
        message: "Please provide correct credentials",
      });
    }
    const jwtPayload = {
      email: user.email,
      id: user._id,
    };
    const token = jwtHelper.generateJwtToken(jwtPayload);
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Please provide correct credentials",
      });
    }
    res.status(200).json({
      message: "success",
      token,
    });
  } catch (error) {
    res.status(401).json({
      status: "fail",
      message: "unable to authorize the user",
    });
  }
};

module.exports = {
  signup,
  login,
};
