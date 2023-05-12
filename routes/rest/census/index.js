const mongoose = require("mongoose")
const Region = require("../../../models/regions")

module.exports = {
  async get(req, res) {
    try {
      return 0
    // eslint-disable-next-line no-unreachable
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
