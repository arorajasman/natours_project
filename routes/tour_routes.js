const express = require("express");

const {
  getAllTours,
  createTour,
  getTourById,
  updateTourById,
  deleteTourById,
} = require("../controllers/tour_controller");
const authUserMiddleware = require("../middlewares/authenticate_user_middleware");

const router = express.Router();

router
  .route("/")
  .get(authUserMiddleware.authenticateUserMiddleware, getAllTours)
  .post(authUserMiddleware.authenticateUserMiddleware, createTour);

router
  .route("/:id")
  .get(authUserMiddleware.authenticateUserMiddleware, getTourById)
  .patch(authUserMiddleware.authenticateUserMiddleware, updateTourById)
  .delete(authUserMiddleware.authenticateUserMiddleware, deleteTourById);

module.exports = router;
