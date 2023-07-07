const mongoose = require("mongoose")

const StateSchema = new mongoose.Schema({

  geoId: {
    type: String,
    unique: true
  },
  stateName: {
    type: String
  }

})

StateSchema.set("timestamps", true)
StateSchema.set("toJSON", { virtuals: true })
StateSchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("State", StateSchema)
