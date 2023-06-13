const Openrouteservice = require("openrouteservice-js")
const Region = require("../../../models/regions")

module.exports = {

  /**
   *
   * @api {get} /search/radius Radius Search
   * @apiName Radius Search
   * @apiGroup GeoId Census Block Search
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiQuery {Number} long Enter longitude of the given point
   * @apiQuery {Number} lat Enter latitude of the given point
   * @apiQuery {Number} rad Enter scaler distance/radius in terms of meters
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "region": [
          {}
        ]
   *  }
  */

  async radiusSearch(req, res) {
    const { long, lat, rad } = req.query

    try {
      // validation start.........

      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(long)) || long === null || long > 180 || long < -180) {
        return res.status(400).json({ error: true, message: "Field 'long' not valid !!!" })
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(lat)) || lat === null || lat > 90 || lat < -90) {
        return res.status(400).json({ error: true, message: "Field 'lat' not valid !!!" })
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(rad)) || rad < 0 || rad === null) {
        return res.status(400).json({ error: true, message: "Field 'rad' must be non-negative number!!!" })
      }
      // validation end..........

      const regionData = await Region.find(
        {
          geographicLevel: "Blocks",
          centroid: {
            $nearSphere: {
              $geometry: { type: "Point", coordinates: [Number(long), Number(lat)] },
              $maxDistance: Number(rad),
            }
          }
        },
      ).populate({ path: "_census" }).exec()
      return res.status(200).json({ error: false, regions: regionData })
    } catch (err) {
      return res.status(500).json({ error: true, message: err.message })
    }
  },

  /**
   *
   * @api {get} /search/drivetime DriveTime Search
   * @apiName DriveTime Search
   * @apiGroup GeoId Census Block Search
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiQuery {Number} long Enter longitude of the given point
   * @apiQuery {Number} lat Enter latitude of the given point
   * @apiQuery {Number} range Enter range in terms of meters
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "regions": [
          {}
        ]
   *  }
  */

  async driveTime(req, res) {
    try {
      const { long, lat, range } = req.query

      // const Isochrones = new Openrouteservice.Isochrones({ api_key: process.env.DIRECTION_API_KEY })
      const Isochrones = new Openrouteservice.Isochrones({ api_key: process.env.DIRECTION_API_KEY, host: "http://localhost:8080/ors" })

      const { features } = await Isochrones.calculate({
        locations: [[Number(long), Number(lat)]],
        profile: "driving-car",
        range: [Number(range)],
        range_type: "time"
      })

      const regions = await Region.find({
        centroid: {
          $geoWithin: {
            $geometry: features[0].geometry
          }
        }
      }).exec()

      return res.status(200).json({ error: true, regions })
    } catch (error) {
      // console.log('--------', JSON.stringify(error))
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   *
   * @api {get} /search/msa MSA Search
   * @apiName MSA Search
   * @apiGroup GeoId Census Block Search
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiParam {Number} geoId Enter geoId of the given point
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "regions": [
          {}
        ]
   *  }
  */
  async msa(req, res) {
    const { geoId } = req.params

    try {
      const msa = await Region.findOne({
        geoId,
        geographicLevel: "MSA"
      }).exec()

      if (msa === null) return res.status(400).json({ error: true, message: `No such MSA with geo id ${geoId}` })

      const regionsWithinMsa = await Region.find({
        geographicLevel: "Blocks",
        centroid: {
          $geoWithin: {
            $geometry: msa.toObject().geometry
          }
        }
      }).populate({ path: "_census" }).exec()
      return res.status(200).json({ error: false, regions: regionsWithinMsa })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   *
   * @api {get} /search/zipcode Zipcode Search
   * @apiName Zipcode Search
   * @apiGroup GeoId Census Block Search
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiParam {Number} geoId Enter geoId of the given point
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "regions": [
          {}
        ]
   *  }
  */
  async zipcode(req, res) {
    const { geoId } = req.params

    try {
      const zipcode = await Region.findOne({
        geoId,
        geographicLevel: "Zipcode"

      }).exec()

      if (zipcode === null) return res.status(400).json({ error: true, message: `No such Zipcode with geo id ${geoId}` })

      const regionsWithinZipcode = await Region.find({

        geographicLevel: "Blocks",
        centroid: {
          $geoWithin: {
            $geometry: zipcode.toObject().geometry
          }
        }
      }).populate({ path: "_census" }).exec()
      return res.status(200).json({ error: false, regions: regionsWithinZipcode })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   *
   * @api {get} /search/point Point Search
   * @apiName point search
   * @apiGroup GeoId Census Block Search
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
  async point(req, res) {
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
        geographicLevel: "Blocks",
        geometry: {
          $geoIntersects: {
            $geometry: searchPoint
          },
        },
      }).populate({ path: "_census" }).exec()
      return res.status(200).json({ error: false, point: searchRegionData })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }

}
