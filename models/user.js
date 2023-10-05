const crypto = require("crypto");

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: [true, "A user must have unique email"],
      required: [true, "A user must have an email"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "A user must have a password"],
      minlength: 8,
      select: false, // not show password with the details of the user
    },
    photo: {
      type: String,
      default: "", // default user profile photo
    },
    // property to get time when password was changed
    passwordChangedAt: Date,
    // properties to get the passwordResetToken and the time when the password reset token expires
    passwordResetToken: String,
    passwordResetTokenExpiresIn: Date,
  },
  // the code below is used to show the virtual properties on the user document
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// using pre save middleware to encrypt the user password before saving it in
// the database
userSchema.pre("save", async function (next) {
  // if the password is modified then only we are encrypting the password field
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// middleware to update the value of passwordChangedAt property before the
// document is saved
userSchema.pre("save", function (next) {
  // using the this.isNew property to check that if the current document is a new document
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 5000;
  next();
});

// creating an instance method that will be available on all the documents
// for the user collection and using it to compare the password provided
// by the user with the password present in the database

// the name of the method is comparePassword
userSchema.methods.comparePassword = async function (
  userPassword,
  passwordHash
) {
  return await bcrypt.compare(userPassword, passwordHash);
};

// instance method to check if the user password was changed
userSchema.methods.checkIfPasswordChanged = function (jwtTokenIssuedTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedAtTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwtTokenIssuedTimestamp < passwordChangedAtTimestamp;
  }
  return false; // i.e. user has not changed the password after the token
  // has been issued
};

// instance method to generate a random token for the user to do forgot password functionality
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  // encrypting the reset token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // setting the value of passwordResetTokenExpiresIn to 10 mins
  this.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = User = mongoose.model("User", userSchema);
