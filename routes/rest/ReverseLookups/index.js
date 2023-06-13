module.exports = {

  async searchByLongLat(req, res) {
    try {
      return res.status(501).json({ error: true, message: "Not implemented" })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  async searchByGeoId(req, res) {
    try {
      return res.status(501).json({ error: true, message: "Not implemented" })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
}