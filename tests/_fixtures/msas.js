const mongoose = require("mongoose")

module.exports = [{
  _id: mongoose.Types.ObjectId("647886001126bf6fa5968a7c"),
  geoId: "60650408222",
  name: "Block Group 1, Census Tract 408.21, Riverside County, California",
  geographicLevel: "Zipcode",
  state: 6,
  country: 37,
  tract: 197200,
  blockGroup: 1,
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
  }
}]
