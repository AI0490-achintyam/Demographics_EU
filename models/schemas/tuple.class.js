const mongoose = require("mongoose")

class Tuple extends mongoose.SchemaType {
  constructor(key, options) {
    super(key, options, "Tuple")
  }

  // eslint-disable-next-line class-methods-use-this
  validate(val) {
    if (!Array.isArray(val)) throw new Error("Not an array!!!")
    if (val.length !== 2) throw new Error("Must be of size 2!!!")
    return false
  }

  // `cast()` takes a parameter that can be anything. You need to
  // validate the provided `val` and throw a `CastError` if you
  // can't convert it.
  // eslint-disable-next-line class-methods-use-this
  cast(val) {
    if (!Array.isArray(val)) throw new Error("Not an array!!!")
    if (val.length !== 2) throw new Error("Must be of size 2!!!")
    return val
  }
}

module.exports = Tuple
