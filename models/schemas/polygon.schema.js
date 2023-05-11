const mongoose = require("mongoose")
const CoordinatePair = require("./coordinate-pair.class")
mongoose.Schema.Types.CoordinatePair = CoordinatePair

const GeoPolygonSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Polygon"],
    required: true
  },
  coordinates: {
    type: [[CoordinatePair]],
    required: true
  }
})

module.exports = GeoPolygonSchema
