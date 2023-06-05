const mongoose = require("mongoose")

module.exports = [{
  _id: mongoose.Types.ObjectId("64645fc10adf19295e261088"),
  userName: "test",
  password: "test",
  name: {
    first: "Rishi",
    last: "Mishra"
  },
  email: "rishi@test.com",
  phoneNumber: "9977665544",
  isActiveStatus: true,
  isDeleted: false,
  forgotpassword: {
    requestedAt: null,
    token: null,
    expiresAt: null
  },
  _createdBy: "64645fa20adf19295e261087",
  _updatedBy: null,
  createdAt: "2023-02-07T09:29:49.267+00:00",
  updatedAt: "2023-02-07T09:29:49.267+00:00"
},
{
  _id: mongoose.Types.ObjectId("64645fa20adf19295e261087"),
  userName: "super",
  password: "super",
  name: {
    first: "super",
    last: "user"
  },
  email: "superuser@test.com",
  phoneNumber: "9038826507",
  isActiveStatus: true,
  isDeleted: false,
  forgotpassword: {
    requestedAt: null,
    token: null,
    expiresAt: null
  },
  _createdBy: null,
  _updatedBy: null,
  createdAt: "2023-02-07T09:29:49.267+00:00",
  updatedAt: "2023-02-07T09:29:49.267+00:00"
},
{
  _id: mongoose.Types.ObjectId("64645ff80adf19295e261089"),
  userName: "rohit",
  password: "$2b$10$wV.8Yn8R0CfTv257dgDRYOJdZWLsesKCi4xvsu/ym/U6vQ63snJ96",
  name: {
    first: "Rohit",
    last: "Santra"
  },
  email: "rohit@test.com",
  phoneNumber: "7980792906",
  isActiveStatus: true,
  isDeleted: false,
  forgotpassword: {
    requestedAt: null,
    token: null,
    expiresAt: null
  },
  _createdBy: "64645fa20adf19295e261087",
  _updatedBy: null,
  createdAt: "2023-02-07T09:29:49.267+00:00",
  updatedAt: "2023-02-07T09:29:49.267+00:00"
},
{
  _id: mongoose.Types.ObjectId("646460100adf19295e26108a"),
  userName: "rahul",
  password: "$2b$10$wV.8Yn8R0CfTv257dgDRYOJdZWLsesKCi4xvsu/ym/U6vQ63snJ96",
  name: {
    first: "Rahul",
    last: "Banerjee"
  },
  email: "rahul@test.com",
  phoneNumber: "7980792920",
  isActiveStatus: false,
  isDeleted: false,
  forgotpassword: {
    requestedAt: null,
    token: null,
    expiresAt: null
  },
  _createdBy: "64645fa20adf19295e261087",
  _updatedBy: null,
  createdAt: "2023-02-07T09:29:49.267+00:00",
  updatedAt: "2023-02-07T09:29:49.267+00:00"
},
{
  _id: mongoose.Types.ObjectId("646460210adf19295e26108b"),
  userName: "raj",
  password: "$2b$10$wV.8Yn8R0CfTv257dgDRYOJdZWLsesKCi4xvsu/ym/U6vQ63snJ96",
  name: {
    first: "Raj",
    last: "Goswami"
  },
  email: "raj@test.com",
  phoneNumber: "7980792920",
  isActiveStatus: false,
  isDeleted: true,
  forgotpassword: {
    requestedAt: null,
    token: null,
    expiresAt: null
  },
  _createdBy: "64645fa20adf19295e261087",
  _updatedBy: null,
  createdAt: "2023-02-07T09:29:49.267+00:00",
  updatedAt: "2023-02-07T09:29:49.267+00:00"
}]
