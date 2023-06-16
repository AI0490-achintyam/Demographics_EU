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
    try {
      const { long, lat, rad } = req.query
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
   * @apiQuery {Number} Time Enter time in terms of minutes
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
      const {
        lon, lat, profile, minutes
      } = req.query

      // validation start.........

      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(lon)) || lon === null || lon > 180 || lon < -180) {
        return res.status(400).json({ error: true, message: "Field 'long' not valid !!!" })
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(lat)) || lat === null || lat > 90 || lat < -90) {
        return res.status(400).json({ error: true, message: "Field 'lat' not valid !!!" })
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(Number(minutes)) || minutes > 60 || minutes <= 0) {
        return res.status(400).json({ error: true, message: "Field 'minutes' must be a positive number less than 60!!" })
      }
      if (typeof profile !== "string" || !["cycling", "driving", "walking"].includes(profile)) {
        return res.status(400).json({ error: true, message: "Field 'profile' is not valid !!!" })
      }

      const urlBase = process.env.MAPBOX_BASE_URL

      const response = await fetch(`${urlBase}${profile}/${lon},${lat}?contours_minutes=${minutes}&polygons=true&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`)
      if (!response.ok) {
        throw new Error("Error retrieving data")
      }
      const { features } = await response.json()

      const regions = await Region.find({
        geographicLevel: "Blocks",
        centroid: {
          $geoWithin: {
            $geometry: features[0].geometry
          }
        }
      })

      return res.status(200).send({ error: false, regions })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   *
   * @api {get} /search/msa/{geoId} MSA Search
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
    try {
      const { geoId } = req.params
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
   * @api {get} /search/zipcode/{geoId} Zipcode Search
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
  }
}
