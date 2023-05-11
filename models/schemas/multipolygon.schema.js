const mongoose = require("mongoose")
const CoordinatePair = require("./coordinate-pair.class")
mongoose.Schema.Types.CoordinatePair = CoordinatePair

const GeoMultiPolygonSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["MultiPolygon"],
    required: true
  },
  coordinates: {
    type: [[[CoordinatePair]]],
    required: true
  }
})
module.exports = GeoMultiPolygonSchema
