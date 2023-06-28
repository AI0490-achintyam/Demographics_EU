const Reference = require("../../../models/reference")

module.exports = {

  async categories(req, res) {
    try {
      const result = await Reference.distinct("category")
      return res.status(200).json({ error: false, categories: result })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  async attributes(req, res) {
    const { category, page, size } = req.query
    try {
      const query = { category }

      if (typeof category !== "undefined") {
        query.category = category
      }

      const paginationOptions = {
        page,
        limit: size,
        // populate: [{ path: "_census" }],
        // select: "-centroid -geometry",
        sort: { _id: -1 }
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
  }
}
