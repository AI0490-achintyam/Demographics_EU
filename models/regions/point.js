const mongoose = require("mongoose")
const GeoPointSchema = require("../schemas/point.schema")
const Region = require("./index")

const PointRegionSchema = new mongoose.Schema({
  geometry: GeoPointSchema
})

PointRegionSchema.set("timestamps", true)
PointRegionSchema.set("toJSON", { virtuals: true })
PointRegionSchema.set("toObject", { virtuals: true })

// eslint-disable-next-line prefer-arrow-callback
PointRegionSchema.post("validate", function (error, doc, next) {
  console.log("error ==> ", error)
  if (error?.errors["geometry.coordinates.0"].name === "CastError") {
    return next(new Error("Coordinates must be specified as a numeric array of length 2"))
  }
  return next(error)
})
// eslint-disable-next-line prefer-arrow-callback
PointRegionSchema.post("save", function (error, doc, next) {
  console.log("11111111111 ==> ", error.name)
  if (error.name === "MongoServerError") {
    return next(new Error("Invalid Point Data"))
  }
  return next(error)
})

module.exports = Region.discriminator("PointRegion", PointRegionSchema, "Point")
