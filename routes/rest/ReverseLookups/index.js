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
   * @apiQuery {Number}[page=1] Enter page number, default value is 1
   * @apiQuery {Number}[size=10] Enter size of data, default value is 10
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
        {
          long, lat, page = 1, size = 10
        } = req.query
      // validation start.........

      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(page))) return res.status(400).json({ error: true, message: "Field 'page' must be a number" })
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(size))) return res.status(400).json({ error: true, message: "Field 'size' must be a number" })

      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(long)) || long > 180 || long < -180 || long === null) {
        return res.status(400).json({ error: true, message: "Field 'long' not valid !!!" })
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(lat)) || lat > 90 || lat < -90 || lat === null) {
        return res.status(400).json({ error: true, message: "Field 'lat' not valid !!!" })
      }
      // validation end

      const query = {
        geographicLevel: { $in: ["Country", "State", "County", "Tract", "Places", "MSA", "Zipcode"] },
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: [Number(long), Number(lat)],
            }
          },
        },
      }

      const paginationOptions = {
        page,
        limit: size,
        // populate: [{ path: "_census" }],
        select: "geoId name geographicLevel",
        sort: { _id: -1 }
      }

      const { docs } = await Region.paginate(query, paginationOptions)

      return res.status(200).json({ error: false, point: docs })
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
   * @apiQuery {Number}[page=1] Enter page number, default value is 1
   * @apiQuery {Number}[size=10] Enter size of data, default value is 10
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

      const query = {
        geometry: {
          $geoIntersects: {
            $geometry: getGeoId.centroid
          },
        },
      }

      const paginationOptions = {
        page,
        limit: size,
        // populate: [{ path: "_census" }],
        select: "geoId name geographicLevel",
        sort: { _id: -1 }
      }

      const { docs } = await Region.paginate(query, paginationOptions)
      // .populate({ path: "_census" }).exec()

      return res.status(200).json({ error: false, region: docs })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
}
