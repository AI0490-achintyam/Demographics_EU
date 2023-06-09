const mongoose = require("mongoose")
const Reference = require("../../../models/reference")

module.exports = {

  /**
   *
   * @api {get} /references/censusattributes Get CensusAttributes
   * @apiName getCensusAttributes
   * @apiGroup References
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiParam {Number} [Term] Enter variableId
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
    const { term, page = 1, size = 50 } = req.query
    try {
      if (term !== "undefined") {
        console.log("term ==> ", term)
        if (typeof term !== "string") {
          console.log("term 1 ==> ", term)
          return res.status(400).json({ error: true, message: "field 'term' must be string" })
        }
        const data = await Reference.findOne({ variableId: term })
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

  /**
   *
   * @api {get} /references/msa Get MSA
   * @apiName getMsa
   * @apiGroup References
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "msas": [
          {
            "name": "My MSA",
            "geoid": "123456"
          }
        ]
      }
  */
  async msa(req, res) {
    try {
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   *
   * @api {get} /references/years Get Years
   * @apiName getYears
   * @apiGroup References
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "years": [
          "2010",
          "2012",
          "2013",
          "2014"
        ]
      }
  */
  async years(req, res) {
    try {
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   *
   * @api {get} /references/forecastyears Get forecastYear
   * @apiName getForecastYears
   * @apiGroup References
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "years": [
          "2010",
          "2012",
          "2013",
          "2014"
        ]
      }
  */
  async forecastYears(req, res) {
    try {
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
}
