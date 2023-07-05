const Reference = require("../../../models/reference")
const Census = require("../../../models/census")

module.exports = {
  /**
   *
   * @api {post} /demographicsData/bygeoid/{geoId} Search By GeoId
   * @apiName searchByGeoId
   * @apiGroup Demographics Data
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiQuery {String} GeoId Enter geoId
   * @apiBody {String} [censusAttributes] Enter censusAttribute Either censusAttributes or censusCategory is mandatory
   * @apiBody {String} [censusCategory] Enter censusCategory Either censusAttributes or censusCategory is mandatory
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "region": [
          {}
        ]
   *  }
  */
  async byGeoId(req, res) {
    try {
      const { geoId } = req.params
      const { censusAttributes, censusCategory } = req.body

      if (censusAttributes === undefined && censusCategory === undefined) return res.status(400).json({ error: true, message: "At least one of censusAttributes or censusCategories must be specified!" })

      let references = []

      if (Array.isArray(censusAttributes)) {
        references = await Reference.find({ attribute: { $in: censusAttributes } }).lean().exec()
      } else if (typeof censusCategory === "string") {
        references = await Reference.find({ category: censusCategory }).lean().exec()
      }

      const chosenAttributes = references.map(({ attribute }) => attribute) // .join("|")

      if (chosenAttributes.length === 0) return res.status(400).json({ error: true, message: "Please specify some valid census attributes!" })

      const censusData = await Census.findOne({
        geoId,
      })
        .select([
          "-_id",
          "geoId",
          "name",
          // "censusBlocks",
          ...chosenAttributes.map((att) => `censusAttributes.${att}`)
        ])
        .lean()
        .exec()

      if (censusData === null) return res.status(400).json({ error: true, message: `No such geo id ${geoId}` })

      return res.status(200).json({ error: false, censusData })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
