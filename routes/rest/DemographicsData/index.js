const execa = require("execa")
const { rimraf } = require("rimraf")
const fs = require("fs")
const Region = require("../../../models/regions")

module.exports = {
  /**
   *
   * @api {get} /demographicsData/customfile Shape file upload
   * @apiName shapeFile
   * @apiGroup Demographics Data
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiQuery {file} rdocs Insert only .shp file
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "regions": [
          {}
        ]
   *  }
  */
  async byShapeFile(req, res) {
    try {
      const rdocs = req.file

      if (rdocs.originalname.split(".").filter(Boolean).slice(1).join(".") !== "shp") {
        await rimraf(rdocs.path)
        return res.status(400).json({ error: true, message: "Only .shp file extension support" })
      }
      process.env.SHAPE_RESTORE_SHX = "YES"

      // convert .shp to geojson file of selected destination
      await execa("ogr2ogr", ["-f", "GeoJSON", `/home/ai/DemographicsAPI/${rdocs.destination}/output.geojson`, `/home/ai/DemographicsAPI/${rdocs.path}`])

      // Read the GeoJSON file
      const filePath = `/home/ai/DemographicsAPI/${rdocs.destination}/output.geojson`
      const data = await fs.promises.readFile(filePath, "utf8")
      const geojsonData = JSON.parse(data)
      const features = geojsonData.features?.[0]?.geometry

      const geoData = await Region.find(
        {
          geographicLevel: "Blocks",
          centroid: {
            $geoWithin: {
              $geometry: features
            }
          }
        },
      ).exec()
      await rimraf(`/home/ai/DemographicsAPI/public/upload/rdoc/${rdocs.destination.split("/").pop()}`)

      return res.status(200).json({ error: true, message: "display regions", regions: geoData })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   *
   * @api {get} /demographicsData/custompolygon Custom Polygon
   * @apiName Custompolygon
   * @apiGroup Demographics Data
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiQuery {String} longitude Enter longitude
   * @apiQuery {String} latitude Enter latitude
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "region": [
          {}
        ]
   *  }
  */
  async byCustomPolygon(req, res) {
    try {
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   *
   * @api {get} /demographicsData/bygeoid/{geoId} Search By GeoId
   * @apiName searchByGeoId
   * @apiGroup Demographics Data
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
  async byGeoId(req, res) {
    try {
      const { geoId } = req.params
      const getGeoId = await Region.findOne({
        geoId

      }).exec()
      if (getGeoId === null) return res.status(400).json({ error: true, message: `No such Zipcode with geo id ${geoId}` })

      const regionData = await Region.findOne({
        geoId
      }).populate({ path: "_census" }).exec()

      if (!regionData) {
        return res.status(400).json({ error: true, reason: "Region not found" })
      }
      return res.status(200).json({ error: false, region: regionData })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   *
   * @api {get} /demographicsData/radius Search By radius
   * @apiName searchByradius
   * @apiGroup Demographics Data
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiQuery {Number} long Enter longitude of the given point
   * @apiQuery {Number} lat Enter latitude of the given point
   * @apiQuery {Number} rad Enter scaler distance/radius in terms of meters
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "region": [
          {}
        ]
   *  }
  */
  async byRadius(req, res) {
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
   * @api {get} /demographicsData/drivetime DriveTime Search
   * @apiName DriveTimeSearch
   * @apiGroup Demographics Data
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

  async byDriveTime(req, res) {
    try {
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
