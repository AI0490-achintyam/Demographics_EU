const mongoose = require("mongoose")

const DemoCensusSchema = new mongoose.Schema({
  geoId: {
    type: String,
    unique: true
  },
  name: String,
  geographicLevel: {
    type: String,
    enum: ["Country", "State", "County", "Tract", "Block Group", "Blocks", "Places", "MSA", "Zipcode", "County Subdivisions"]
  },

  attributes: {
    type: mongoose.Schema.Types.Mixed
  }

})
module.exports = mongoose.model("Census", DemoCensusSchema)
