const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const ReferenceSchema = new mongoose.Schema({

  tableId: String,
  concept: String,
  universe: String,
  variableId: {
    type: String,
    required: true
  },
  lebel: String,
  moe: String, // Eastimate/margin of error
  description: String

})

ReferenceSchema.set("timestamps", true)
ReferenceSchema.set("toJSON", { virtuals: true })
ReferenceSchema.set("toObject", { virtuals: true })
ReferenceSchema.plugin(mongoosePaginate)

module.exports = mongoose.model("Reference", ReferenceSchema)
