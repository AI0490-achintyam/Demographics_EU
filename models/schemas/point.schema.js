const mongoose = require("mongoose")
const CoordinatePair = require("./coordinate-pair.class")
mongoose.Schema.Types.CoordinatePair = CoordinatePair

const GeoPointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true
  },
  coordinates: {
    type: CoordinatePair,
    required: true
  }
})

module.exports = GeoPointSchema
