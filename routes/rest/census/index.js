const mongoose = require("mongoose")
const Census = require("../../../models/census")

module.exports = {
  async get(req, res) {
    const { geoid } = req.params
    try {
      const allCensusData = await Census.findOne({
        geoId: geoid
      })

      if (!allCensusData) {
        return res.status(400).json({ error: true, message: "No such census data !!!" })
      }
      return res.status(200).json({ error: true, census: allCensusData })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
