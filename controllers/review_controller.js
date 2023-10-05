const Review = require("../models/review");

/** @type {import("express").RequestHandler} */
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find();
    return res.status(200).json({ status: "success", data: reviews });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "Error while getting reviews",
      error,
    });
  }
};

/** @type {import("express").RequestHandler} */
const getDetailsOfReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        error: `Review with id ${req.params.id} not found`,
      });
    }
    return res.status(200).json({
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message:
        "Error while getting the details of the Review from the database",
      error,
    });
  }
};

/** @type {import("express").RequestHandler} */
const addReview = async (req, res, next) => {
  try {
    const data = await Review.create(req.body);
    if (!data) {
      return res.status(400).json({
        error: "Unable to add the review",
      });
    }
    res.status(201).json({
      message: "Review saved successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Error while saving the review",
      error,
    });
  }
};

module.exports = {
  getAllReviews,
  getDetailsOfReviewById,
  addReview,
};
