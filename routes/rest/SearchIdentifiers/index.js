const Region = require("../../../models/regions")

module.exports = {
/**
   * @api {get} /searchIdentifiers/byname Search By Name
   * @apiName Search By Name
   * @apiGroup Search Identifiers
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiQuery {String} Name Enter name to search
   * @apiQuery {Enum} [geographicalLevel] Enter geographicalLevel
   * @apiQuery {Number}[page=1] Enter page number, default value is 1
   * @apiQuery {Number}[size=10] Enter size of data, default value is 10
   *
   * @apiSuccessExample {json} Success-Response:200
   *   {
            "error": false,
            "regions": [
            {}
            ]
    */

  async searchByName(req, res) {
    const {
      geographicLevel, name, page = 1, size = 10
    } = req.query

    try {
      if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: true, message: "Field 'name' not valid format!!!" })
      }
      const query = { $text: { $search: name } }

      if (geographicLevel !== undefined) {
        if (typeof geographicLevel === "string" && ["Country", "State", "County", "Tract", "Block Group", "Blocks", "Places", "MSA", "Zipcode", "msaType"].includes(geographicLevel)) {
          query.geographicLevel = geographicLevel
        } else {
          return res.status(400).json({ error: true, message: "Field 'geographicLevel' not found !!!" })
        }
      }

      const paginationOptions = {
        page,
        limit: size,
        populate: [{ path: "_census" }],
        sort: { _id: -1 }
      }
      const { docs } = await Region.paginate(
        query,
        paginationOptions
      )

      return res.status(200).json(
        {
          error: false,
          regions: docs,
        }
      )
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   * @api {get} /searchIdentifiers/byzipcode Search By Zipcode
   * @apiName Search By Zipcode
   * @apiGroup Search Identifiers
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiQuery {String} Zipcode Enter zipcode for geographicLevel: Zipcode
   * @apiQuery {Number}[page=1] Enter page number, default value is 1
   * @apiQuery {Number}[size=10] Enter size of data, default value is 10
   *
   * @apiSuccessExample {json} Success-Response:200
   *   {
            "error": false,
            "regions": [
            {}
            ]
    */
  async searchByZipcode(req, res) {
    const {
      zipcode, page = 1, size = 10
    } = req.query

    try {
      if (typeof zipcode !== "string" || zipcode.trim() === "") {
        return res.status(400).json({ error: true, message: "Field 'zipcode' not valid format!!!" })
      }
      const query = { $text: { $search: zipcode }, geographicLevel: "Zipcode" }

      const paginationOptions = {
        page,
        limit: size,
        populate: [{ path: "_census" }],
        sort: { _id: -1 }
      }
      const { docs } = await Region.paginate(
        query,
        paginationOptions
      )

      return res.status(200).json(
        {
          error: false,
          regions: docs,
        }
      )
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

}