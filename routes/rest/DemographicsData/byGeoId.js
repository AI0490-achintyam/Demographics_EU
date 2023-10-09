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
        "geoId":"ZCTA5 32003",
        "name": "32003",
        "censusData": [
          {}
        ]
   *  }
  */
  async byGeoId(req, res) {
    try {
      const { geoId } = req.params
      const { censusAttributes, censusCategory } = req.body

      if (censusAttributes === undefined && censusCategory === undefined) return res.status(400).json({ error: true, message: "At least one of censusAttributes or censusCategory must be specified!" })

      let references = []

      if (Array.isArray(censusAttributes)) {
        references = await Reference.find({ attribute: { $in: censusAttributes } }).lean().exec()
      } else if (typeof censusCategory === "string") {
        references = await Reference.find({ category: censusCategory }).lean().exec()
      }

      const chosenAttributes = references.map(({ attribute }) => attribute) // .join("|")

      if (chosenAttributes.length === 0) return res.status(400).json({ error: true, message: "Please specify some valid census attributes!" })

      const census = await Census.findOne({
        geoId,
      })
        .select([
          "-_id",
          "geoId",
          "name",
          "area",
          // "censusBlocks",
          ...chosenAttributes.map((att) => `censusAttributes.${att}`)
        ])
        .lean()
        .exec()

      if (census === null) return res.status(400).json({ error: true, message: `No such geo id ${geoId}` })

      let censusData = census.censusAttributes

      if (censusData !== null) {
        censusData = Object.keys(censusData).reduce((acc, cur) => {
          const foundRef = references.find((r) => r.attribute === cur)
          if (foundRef === undefined) return acc // filter unneccessery record

          const keySplit = cur.split("_")
          const suffix = keySplit.pop()
          const prefixes = keySplit.join("_") // may contain multiple _ within it
          if (suffix.startsWith("E")) {
            const moeKey = `${prefixes}_${suffix.replace(/^E/, "M")}`
            const record = {
              name: foundRef?.name,
              universe: foundRef?.universe,
              censusCategory: foundRef?.category,
              attribute: cur,
              value: censusData[cur],
            }
            if (censusData[moeKey] !== undefined) record.moE = censusData[moeKey]
            acc.push(record)
          }
          return acc
        }, [])
      }

      delete census.censusAttributes
      return res.status(200).json(
        { error: false, ...census, censusData }
      )
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
