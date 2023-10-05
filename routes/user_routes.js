const express = require("express");

const {
  forgotPassword,
  resetPassword,
  updateUserDetailsById,
  deleteUserDetailsById,
} = require("../controllers/users_controller");
const authUserMiddleware = require("../middlewares/authenticate_user_middleware");

const router = express.Router();

router.post("/:email/forgot-password", forgotPassword);
router.patch("/reset-password/:resetToken", resetPassword);
router.patch(
  "/:id",
  authUserMiddleware.authenticateUserMiddleware,
  updateUserDetailsById
);
router.delete(
  "/:id",
  authUserMiddleware.authenticateUserMiddleware,
  deleteUserDetailsById
);

module.exports = router;
