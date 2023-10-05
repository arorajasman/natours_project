const Tour = require("../models/tour");

/** @type {import("express").RequestHandler} */
const getAllTours = async (req, res, next) => {
  try {
    const { queryObject } = { ...req.query };
    // Filtering the data
    const excludedFields = ["page", "sort", "limit", "fields"];
    if (queryObject) {
      excludedFields.forEach((element) => delete queryObject[element]);
    }
    const queryString = JSON.stringify(queryObject);
    if (queryString) {
      queryString = queryString.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
    }

    let toursQuery = queryString
      ? Tour.find(JSON.parse(queryString))
      : Tour.find();

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      toursQuery = toursQuery.sort(sortBy);
    } else {
      // sorting in descending order by createdAt
      toursQuery = toursQuery.sort("-createdAt");
    }

    // Field Limiting or projecting
    if (req.query.fields) {
      const selectedFields = req.query.split(",").join(" ");
      toursQuery = toursQuery.select(selectedFields);
    } else {
      // by default getting the data without __v field
      toursQuery = toursQuery.select("-__v");
    }

    // Pagination
    const page = req.query.page * 1 || 1; // converting the string to number
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    if (req.query.page) {
      // getting the number of documents from the database
      const numberOfTours = await Tour.countDocuments();
      if (skip >= numberOfTours) throw new Error("This page does not exists");
    }
    toursQuery = toursQuery.skip(skip).limit(limit);

    // NOTE: Example of child referencing or Parent to child referencing
    // using the populate() method and passing the name of the key whose value
    // we want to populate/fill up

    // the populate() method here will only populate the guides array with
    // the details of the guides from the user document only in the response and not
    // in the database
    const tours = await toursQuery;
    // .populate("guides");
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: tours,
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: "Unable to get the tours",
      error,
    });
  }
};

/** @type {import("express").RequestHandler} */
const getTourById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // NOTE: Example of child referencing or Parent to child referencing
    // using the populate() method and passing the name of the key whose value
    // we want to populate/fill up

    // the populate() method here will only populate the reviews array with
    // the details of the reviews from the review document only in the response and not
    // in the database

    // in the code below the path key means the key whose value we want to get
    // using the parent child referencing and using the select attribute and passing
    // -__v since we don't want to get the value of __v here for the particular review
    const tour = await Tour.findById(id).populate({
      path: "reviews",
      select: "-__v",
    });
    if (!tour) {
      return res.status(404).json({
        status: "fail",
        message: `Tour with id ${id} not found`,
      });
    }
    res.status(200).json({
      status: "success",
      data: tour,
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: "Unable to get the tour",
      error,
    });
  }
};

/** @type {import("express").RequestHandler} */
const createTour = async (req, res, next) => {
  try {
    const tour = await Tour.create(req.body);
    if (!tour) {
      return res.status(400).json({
        status: "fail",
        message: "Unable to create the tour",
      });
    }
    res.status(201).json({
      status: "success",
      data: tour,
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: "Unable to create the tour",
      error,
    });
  }
};

/** @type {import("express").RequestHandler} */
const updateTourById = async (req, res, nest) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tour) {
      return res.status(400).json({
        status: "fail",
        message: "Unable to update the tour",
      });
    }
    res.status(200).json({
      status: "success",
      data: tour,
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: "Unable to updating the tour",
      error,
    });
  }
};

/** @type {import("express").RequestHandler} */
const deleteTourById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findByIdAndDelete(id);
    if (!tour) {
      return res.status(400).json({
        status: "fail",
        message: "Unable to delete the tour",
      });
    }
    res.status(204);
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: "Unable to delete the tour",
      error,
    });
  }
};

module.exports = {
  getAllTours,
  getTourById,
  createTour,
  updateTourById,
  deleteTourById,
};
