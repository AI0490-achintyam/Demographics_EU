const Region = require("../../../models/regions")

module.exports = {

  /**
   *
   * @api {get} /reverseLookup/point Search By Longitude & Latitide
   * @apiName searchByLongLat
   * @apiGroup Reverse Lookups
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiQuery {Number} long Enter longitude of the given point
   * @apiQuery {Number} lat Enter latitude of the given point
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "region": [
          {}
        ]
   *  }
  */
  async searchByLongLat(req, res) {
    const { long, lat } = req.query

    try {
      // validation start.........

      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(long)) || long > 180 || long < -180 || long === null) {
        return res.status(400).json({ error: true, message: "Field 'long' not valid !!!" })
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(lat)) || lat > 90 || lat < -90 || lat === null) {
        return res.status(400).json({ error: true, message: "Field 'lat' not valid !!!" })
      }
      // validation end

      const searchPoint = {
        type: "Point",
        coordinates: [Number(long), Number(lat)],
      }

      const searchRegionData = await Region.find({
        geographicLevel: { $in: ["Country", "State", "County", "Tract", "Places", "MSA", "Zipcode"] },
        geometry: {
          $geoIntersects: {
            $geometry: searchPoint
          },
        },
      })
        .select("-_id geoId name geographicLevel")
        .lean()
        // .populate({ path: "_census" })
        .exec()
      return res.status(200).json({ error: false, point: searchRegionData })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   *
   * @api {get} /reverseLookup/geoid/{geoId} Search By GeoId
   * @apiName searchByGeoId
   * @apiGroup Reverse Lookups
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiQuery {String} GeoId Enter geoId
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "region": [
          {}
        ]
   *  }
  */
  async searchByGeoId(req, res) {
    const { geoId } = req.params

    try {
      const getGeoId = await Region.findOne({
        geoId
      })
        .lean()
        .exec()

      if (getGeoId === null) return res.status(400).json({ error: true, message: `No such geo id ${geoId}` })

      const regionData = await Region.find({
        geometry: {
          $geoIntersects: {
            $geometry: getGeoId.centroid
          },
        },
      })
        .select("-_id geoId name geographicLevel")
        .lean()
      // .populate({ path: "_census" }).exec()

      if (regionData === null) {
        return res.status(400).json({ error: true, reason: "Geo ID not found" })
      }
      return res.status(200).json({ error: false, region: regionData })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
}
