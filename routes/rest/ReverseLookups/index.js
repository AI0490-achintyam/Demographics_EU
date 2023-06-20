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
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "region": [
          {}
        ]
   *  }
  */
  async searchByLongLat(req, res) {
    try {
      const
        { long, lat } = req.query
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

      const searchRegionData = await Region.find(
        {
          geographicLevel: { $in: ["Country", "State", "County", "Tract", "Block Group", "Blocks", "Places", "MSA", "Zipcode", "County Subdivisions"] },
          geometry: {
            $geoIntersects: {
              $geometry: {
                type: "Point",
                coordinates: [Number(long), Number(lat)],
              }
            },
          },
        }
      )
        .select("-_id geoId name geographicLevel")
        .lean()
        // .populate({ path: "_census" })
        .exec()

      return res.status(200).json({ error: false, regions: searchRegionData })
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
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "region": [
          {}
        ]
   *  }
  */
  async searchByGeoId(req, res) {
    try {
      const { geoId } = req.params
      const { page = 1, size = 10 } = req.query

      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(page))) return res.status(400).json({ error: true, message: "Field 'page' must be a number" })
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(size))) return res.status(400).json({ error: true, message: "Field 'size' must be a number" })

      const getGeoId = await Region.findOne({
        geoId
      })
        .lean()
        .exec()

      if (getGeoId === null) return res.status(400).json({ error: true, message: `No such geo id ${geoId}` })

      const censusHierarchy = [ // Ref: https://tinyurl.com/ytff8ndh
        "Blocks",
        "Block Group",
        "Tract",
        "County",
        "State",
        "Country"
      ]

      const higherGeographicLevels = censusHierarchy.slice(
        censusHierarchy.indexOf(getGeoId.geographicLevel) + 1
      )

      const searchByGeoId = await Region.find({
        geographicLevel: {
          $in: [
            "Places", "MSA", "Zipcode", "County Subdivisions",
            ...higherGeographicLevels
          ]
        },
        geometry: {
          $geoIntersects: {
            $geometry: getGeoId.centroid
          },
        },
      })
        .select("-_id geoId name geographicLevel")
        .lean()
        .exec()
      // .populate({ path: "_census" }).exec()

      return res.status(200).json({ error: false, region: searchByGeoId })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
}
