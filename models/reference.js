const mongoose = require("mongoose")

const ReferenceSchema = new mongoose.Schema({

  tableId: String,
  line: String,
  indent: String,
  uniqueId: String,
  label: String,
  title: String,
  universe: String,
  dataType: String

})

ReferenceSchema.set("timestamps", true)
ReferenceSchema.set("toJSON", { virtuals: true })
ReferenceSchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("Reference", ReferenceSchema)
