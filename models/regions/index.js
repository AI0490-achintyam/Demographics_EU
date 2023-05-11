const mongoose = require("mongoose")

const RegionSchema = new mongoose.Schema({
  geoId: {
    type: String,
    unique: true
  },
  name: String,
  geographicLevel: {
    type: String,
    enum: ["Country", "State", "County", "Tract", "Block Group", "Blocks", "Places", "MSA", "Zipcode"]
  },
  // _censusdata: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Census",
  // },
})

RegionSchema.set("timestamps", true)
RegionSchema.set("toJSON", { virtuals: true })
RegionSchema.set("toObject", { virtuals: true })

RegionSchema.virtual("_census", {
  localField: "geoId",
  foreignField: "geoId",
  ref: "Census",
  justOne: true
})
// RegionSchema.set("discriminatorKey", "geometryType") // redundant

module.exports = mongoose.model("Region", RegionSchema)
