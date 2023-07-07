const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")
require("../census")

const RegionSchema = new mongoose.Schema({
  geoId: {
    type: String,
    unique: true
  },
  name: String,
  geographicLevel: {
    type: String,
    enum: ["Country", "State", "County", "Tract", "Block Group", "Blocks", "Places", "MSA", "Zipcode", "County Subdivisions"]
  },
  // _censusdata: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: Census,
  // },
  // new fields-------------
  state: {
    type: [String]

  },
  county: {
    type: [String]
  },
  stateName: {
    type: [String]

  },
  countyName: {
    type: [String]

  },
  tract: {
    type: [String]
  },
  blockGroup: {
    type: [String]
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
RegionSchema.plugin(mongoosePaginate)

// RegionSchema.set("discriminatorKey", "geometryType") // redundant

module.exports = mongoose.model("Region", RegionSchema)
