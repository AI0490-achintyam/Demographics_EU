// const region = require("../../../models/regions")

module.exports = {

  async getCoordinates(req, res) {
    try {
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
