const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // NOTE: Examples of parent referencing
    tour: {
      type: mongoose.Schema.ObjectId, // here we are storing the id of the Tour to which this review is related to
      ref: "Tour", // here ref = "Tour" means that the review is related to the Tour document
      required: [true, "A Tour must be associated with the review"],
    },
    // property to get the details of the user who wrote the review
    user: {
      type: mongoose.Schema.ObjectId, // here we are storing the id of the user to which this review is related to
      ref: "User", //here ref="user" means that the review belongs to a particular User document
      required: [true, "A user must be associated with a review"],
    },
  },
  // the code below is used to show the virtual properties on the review document
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// using the pre find middleware to get the details of user and the tour based
// on the id of the user and tour in the review document
reviewSchema.pre(/^find/, function (next) {
  // getting the details of the user and tour using parent referencing based on
  // the id of the user and the tour
  this.populate({
    path: "user",
    select: "name",
  }).populate({
    path: "tour",
    select: "name",
  });
  next();
});

module.exports = Review = mongoose.model("Review", reviewSchema);
