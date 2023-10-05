const jsonwebtoken = require("jsonwebtoken");

exports.generateJwtToken = (payload) => {
  const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
  return token;
};
