const mongoose = require("mongoose")
const GeoPolygonSchema = require("../schemas/polygon.schema")
const Region = require("./index")
const GeoPointSchema = require("../schemas/point.schema")

const PolygonRegionSchema = new mongoose.Schema({
  geometry: GeoPolygonSchema,
  centroid: GeoPointSchema
})

PolygonRegionSchema.set("timestamps", true)
PolygonRegionSchema.set("toJSON", { virtuals: true })
PolygonRegionSchema.set("toObject", { virtuals: true })

// create indexing(2d)for geometry field
PolygonRegionSchema.index({ geometry: "2dsphere" })
PolygonRegionSchema.index({ centroid: "2dsphere" })

// eslint-disable-next-line prefer-arrow-callback
PolygonRegionSchema.post("validate", function (error, doc, next) {
  if (error?.errors["geometry.coordinates.0"].name === "CastError") {
    return next(new Error("Coordinates must be specified as a numeric array of length 2"))
  }
  return next(error)
})
// eslint-disable-next-line prefer-arrow-callback
PolygonRegionSchema.post("save", function (error, doc, next) {
  // console.log("11111111111 ==> ", error.name)
  if (error.name === "MongoServerError") {
    return next(new Error("Invalid Polygon Data"))
  }
  return next(error)
})

module.exports = Region.discriminator("PolygonRegion", PolygonRegionSchema, "Polygon")
