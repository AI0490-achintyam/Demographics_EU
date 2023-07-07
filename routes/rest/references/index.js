const Reference = require("../../../models/reference")
const State = require("../../../models/state")

module.exports = {

  async categories(req, res) {
    try {
      const categories = await Reference.distinct("category").lean().exec()
      return res.status(200).json({ error: false, categories })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  async attributes(req, res) {
    const { category, page = 1, size = 10 } = req.query
    try {
      const query = {}

      if (typeof category !== "undefined") {
        query.category = category
      }

      const paginationOptions = {
        page,
        limit: size,
        select: "-id -_id",
        sort: { attribute: 1 },
        lean: true
      }
      const {
        docs, totalDocs,
        totalPages
      } = await Reference.paginate(query, paginationOptions)

      return res.status(200).json({
        error: false,
        censusAttributes: docs,
        totalData: totalDocs,
        totalPages,
        page: Number(page),
        size: Number(size)
      })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
  async states(req, res) {
    try {
      const states = await State.find({}).select("-_id").lean().exec()
      return res.status(200).json({ error: false, states })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
