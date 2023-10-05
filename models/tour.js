const mongoose = require("mongoose");

// const User = require("./user");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: [true, "A tour must have a unique name"],
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true, // this property is used to remove the white spaces
      // from the start and end of the string
      required: [true, "A Tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A Tour must have a cover image"],
    },
    images: [String], // here we are getting the array of url of images of the tour
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // the property below is used to get the list of startDates for the tour
    startDates: [Date], // here we are getting the array of Date as input

    // NOTE: Example of embedding
    // defining the start location coordinates object for the tour
    startLocation: {
      // property to get the type of the location
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number], // here first value will be longitude and second value will be latitude
      address: String,
      description: String,
    },
    // NOTE: Example of embedding
    // the array below is used to get the list of objects having the details of
    // locations of the tour
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number], // here first value will be longitude and second value will be latitude
        address: String,
        description: String,
        day: Number, // day of the tour
      },
    ],

    // NOTE: Example of embedding
    // using embedding to get the list/array of tour guides
    // guides: Array,

    // NOTE: Example of Child referencing i.e. Parent referencing the child based on id of child

    // the guides array below is used to get the ids of the user and save those
    // in the database and based on that return the guides array having the objects
    // containing the user details but in the database it will save only ids of the user
    guides: [
      {
        // type of data that will be stored in the array
        type: mongoose.Schema.ObjectId,
        // the User keyword below should be same as that we have used to create
        // a user model in the userSchema
        ref: "User", // name of the document/collection to which we are refering to
        // for getting the details of the user based on the id of the user
      },
    ],
  },
  // the code below is used to show the virtual properties on the tour document
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// NOTE: Example of embedding
/*
// creating a pre save middleware to get the details of users for the guides
// array based on the id of the users provided in the guides array before
// saving the details of the tour in the database
tourSchema.pre("save", async function (next) {
  // iterating over the ids in the guides array and getting the details of the
  // user from the user document based on the id of the user and then saving
  // that in the guides array

  // the code below will give us a list of promises
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  // resolving all the promises and assigning the value to the guides array
  this.guides = await Promise.all(guidesPromises);
  next();
});
*/

// NOTE: Example of Child referencing or parent to child referencing
// using the pre find middleware to populate the guides data based on the id
// of the user in the guides array

// using the regular expression /^find/ so as to run the middleware below on any
// query that starts with the find keyword
tourSchema.pre(/^find/, function (next) {
  // NOTE: Example of child referencing or Parent to child referencing

  // using the this keyword since it refers to the current document
  // using the populate() method and passing the name of the key whose value
  // we want to populate/fill up

  // the populate() method here will only populate the guides array with
  // the details of the guides from the user document only in the response and not
  // in the database

  // in the code below the path key means the key whose value we want to get
  // using the parent child referencing and using the select attribute and passing
  // -__v since we don't want to get the value of __v here for the particular guide
  this.populate({
    path: "guides",
    select: "-__v",
  });
  next();
});

// NOTE: Example of virtual populate

// using the virtual() method from the tourSchema to virtually populate the reviews
// related to a tour without saving the ids of the reviews in an array in the tour document

// here reviews is the name of the virtual field that is used to store the list
// of reviews associated with the tour
tourSchema.virtual("reviews", {
  ref: "Review", // reference model i.e Review model to get the reviews related to the tour
  foreignField: "tour", // here foreign field refers to the field in the review model that is used to get the details of the tour related to the review
  localField: "_id", // here local field means the field in the tour model that is used to refer the details of the tour from the review model
});

module.exports = Tour = mongoose.model("Tour", tourSchema);
