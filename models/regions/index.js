const mongoose = require("mongoose")

const RegionSchema = new mongoose.Schema({
  geoId: {
    type: String,
    unique: true
  },
  name: String,
  geographicLevel: {
    type: String,
    enum: ["Country", "State", "County", "Tract", "Block Group", "Blocks", "Places", "MSA", "Zipcode", "msaType"]
  },
  // _censusdata: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Census",
  // },
  // new fields-------------
  state: {
    type: String,
    default: null
  },
  county: {
    type: String,
    default: null
  },
  tract: {
    type: String,
    default: null
  },
  blockGroup: {
    type: String,
    default: null
  }
})

RegionSchema.virtual("_census", {
  localField: "geoId",
  foreignField: "geoId",
  ref: "Census",
  justOne: true
})

RegionSchema.set("timestamps", true)
RegionSchema.set("toJSON", { virtuals: true })
RegionSchema.set("toObject", { virtuals: true })

// RegionSchema.set("discriminatorKey", "geometryType") // redundant

module.exports = mongoose.model("Region", RegionSchema)
