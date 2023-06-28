const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const ReferenceSchema = new mongoose.Schema({

  name: String,
  category: String,
  universe: String,
  attribute: String,
  isMOE: Boolean

})

ReferenceSchema.set("timestamps", true)
ReferenceSchema.set("toJSON", { virtuals: true })
ReferenceSchema.set("toObject", { virtuals: true })
ReferenceSchema.plugin(mongoosePaginate)

module.exports = mongoose.model("Reference", ReferenceSchema)
