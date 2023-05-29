const mongoose = require("mongoose")

module.exports = [{
  _id: mongoose.Types.ObjectId("646706e194140e5d04fdba4b"),
  geoId: "60650408211",
  name: "Block Group 1, Census Tract 408.21, Riverside County, California",
  geographicLevel: "MSA",
  centroid: {
    type: "Point",
    coordinates: [
      -84.091998,
      30.455749
    ]
  },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [
          -84.091998,
          30.455749
        ]
      ]
    ]
  },
  _censusData: {
    geoId: 60371972001,
    name: "Block Group 1, Census Tract 1972, Los Angeles County, California",
    geographicLevel: "MSA",
    state: 6,
    country: 37,
    tract: 197200,
    blockGroup: 1,
    latitude: 34.08929258664407,
    longitude: -118.23513022842144,
    censusAttributes: {}
  }
}]
