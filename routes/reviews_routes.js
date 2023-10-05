const express = require("express");

const {
  getAllReviews,
  addReview,
  getDetailsOfReviewById,
} = require("../controllers/review_controller");
const jwtAuthMiddleware = require("../middlewares/authenticate_user_middleware");

const router = express.Router();

router
  .route("/")
  .get(jwtAuthMiddleware.authenticateUserMiddleware, getAllReviews)
  .post(jwtAuthMiddleware.authenticateUserMiddleware, addReview);

router.get("/:id", getDetailsOfReviewById);

module.exports = router;
