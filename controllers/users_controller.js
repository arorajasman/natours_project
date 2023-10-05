const crypto = require("crypto");

const User = require("../models/user");
const emailHelper = require("../utils/email_helper");
const jwtHelper = require("../utils/jwt_helper");

/** @type {import("express").RequestHandler} */
const forgotPassword = async (req, res, next) => {
  const { email } = req.params;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: `User with ${email} not found`,
    });
  }
  // getting the reset token for resting the password
  const resetToken = user.generatePasswordResetToken();
  // using the save() method on the user instance and passing the value of
  // validateBeforeSave to false to not check for the required values
  await user.save({ validateBeforeSave: false });
  const message = `Forgot your password? here is the reset token for changing the password ${resetToken}`;
  try {
    await emailHelper.sendEmail({
      email,
      message,
      subject: "Your password reset token (valid for 10 mins)",
    });
    res.status(200).json({
      status: "success",
      message: `Token sent to email ${user.email} successfully`,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(400).json({
      status: "fail",
      message: "cannot proceed for forgot password",
      error,
    });
  }
};

/** @type {import("express").RequestHandler} */
const resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  // encrypting the token provided by the user
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // getting the user based on the hashedToken and if the passwordResetTokenExpiresIn
  // is not greater then current time
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresIn: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    return res.status(400).json({
      status: "fail",
      message: "Token is invalid or expired",
    });
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresIn = undefined;
  await user.save({});
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
};

const updateUserDetailsById = async (req, res, next) => {
  try {
    if (req.body.password) {
      return res.status(400).json({
        status: "fail",
        error: "This route is not for updating the password",
      });
    }
    const updatedData = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      message: "user details updated successfully",
      data: updatedData,
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: "Unable to update the user details",
      error,
    });
  }
};

const deleteUserDetailsById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updatedUser = await User.findByIdAndDelete(userId, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(400).json({
        status: "fail",
        error: "unable to delete the details of the tour",
      });
    }
    return res.status(204).json({
      status: "success",
      message: "details of user deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      error: "unable to delete the details of the tour",
    });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
  updateUserDetailsById,
  deleteUserDetailsById,
};
