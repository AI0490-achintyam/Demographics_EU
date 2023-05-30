const mongoose = require("mongoose")
const Reference = require("../../../models/reference")
const reference = require("../../../models/reference")

module.exports = {

  /**
   *
   * @api {get} /references/censusattributes Get Censusattributes
   * @apiName getCensusattributes
   * @apiGroup References
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiParam {Number} [variableId] Enter variableId
   *
   * @apiSuccessExample {json} Success-Response:200
      {
          "error": false,
          "referenceData": [
              {
                  "_id": "6475c7bb0a6d8afb7c0ba2f3",
                  "tableId": "F_B01003",
                  "concept": "POPULATION PROJECTION",
                  "universe": "Total Population (6-Year Forecast)",
                  "variableId": "F_B01003_M003",
                  "lebel": "Total",
                  "moe": "Margin of Error",
                  "description": "Total Population: 6-Year Forecast",
                  "id": "6475c7bb0a6d8afb7c0ba2f3"
              }
          ],
          "totalDocs": 472,
          "totalPages": 472
      }
  */
  async censusattributes(req, res) {
    const { variableId, page = 1, size = 50 } = req.query
    try {
      if (variableId !== undefined) {
        if (typeof variableId !== "string") {
          return res.status(400).json({ error: true, message: "field 'variableId' must be string" })
        }
        const data = await Reference.findOne({ variableId })
        return res.status(200).json({ error: false, referenceData: data })
      }

      const paginationOptions = {
        page,
        limit: size,
        sort: { _id: -1 }
      }

      const query = { variableId: { $ne: null } }

      const {
        docs,
        totalDocs, totalPages
      } = await Reference.paginate(query, paginationOptions)

      return res.status(200).json({
        error: false, referenceData: docs, totalDocs, totalPages
      })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  async msa(req, res) {
    try {
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
  async years(req, res) {
    try {
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
  async forecastYears(req, res) {
    try {
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
}
