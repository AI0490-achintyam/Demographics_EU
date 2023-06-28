const mongoose = require("mongoose")

module.exports = [{
  _id: mongoose.Types.ObjectId("643906210ef1dbad88a04a13"),
  name: "Total Population",
  category: "Total Population",
  universe: "Total Population",
  attribute: "B01003_E001",
  isMOE: false,
},
{
  _id: mongoose.Types.ObjectId("649c08d95631525094bb1332"),
  name: "Black or African American alone",
  category: "Race",
  universe: "Total Population",
  attribute: "B02001_E003",
  isMOE: false
},
{
  _id: mongoose.Types.ObjectId("649c08dc5631525094bb1333"),
  name: "American Indian and Alaska Native alone",
  category: "Race",
  universe: "Total Population",
  attribute: "B02001_M004",
  isMOE: true
},
{
  _id: mongoose.Types.ObjectId("649c08dd5631525094bb1334"),
  name: "Two or more races",
  category: "Race",
  universe: "Total Population",
  attribute: "B02001_M008",
  isMOE: true
}]
