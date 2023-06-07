const Census = require("../../../models/census")

module.exports = {

  /**
   *
   * @api {get} /census/:geoid Get census
   * @apiName getCensusData
   * @apiGroup Census
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiParam {String} geoId Enter geoid of the given census data
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "regions": {}
   *  }
  */
  async get(req, res) {
    const { geoid } = req.params
    try {
      const allCensusData = await Census.findOne({
        geoId: geoid
      })

      if (!allCensusData) {
        return res.status(400).json({ error: true, message: "No such census data !!!" })
      }
      return res.status(200).json({ error: true, censusData: allCensusData })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
