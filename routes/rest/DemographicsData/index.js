const execa = require("execa")
const { rimraf } = require("rimraf")
const fs = require("node:fs/promises")
const cuid = require("cuid")

const radiusConvert = require("../../../lib/radiusConvert")

const Census = require("../../../models/census")
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
      const censusData = await Census.findOne({
        geoId
      })
        .select("censusAttributes -_id")
        .lean()
        .exec()

      if (censusData === null) return res.status(400).json({ error: true, message: `No such geo id ${geoId}` })

      return res.status(200).json({ error: false, censusData: censusData.censusAttributes })
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
    const reqId = cuid() // unique identifier for the endpoint call
    try {
      const
        {
          long, lat, radius // Note: radius input is in MILES
        } = req.query
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
      if (
        // eslint-disable-next-line no-restricted-globals
        isNaN(String(radius))
        || radius < 0
        || radius > 50
        || radius === null
      ) {
        return res.status(400).json({ error: true, message: "Field 'radius' is not valid range!!!" })
      }
      // validation end..........

      // const radiusInMiles = radius / 0.000621371

      const regionData = await Region.find(
        {
          geographicLevel: { $in: ["Blocks", "Block Group"] },
          centroid: {
            $nearSphere: {
              $geometry: { type: "Point", coordinates: [Number(long), Number(lat)] },
              $maxDistance: Number(radiusConvert.miles2meters(radius)), // convert input radius in miles to meters
            }
          }
        },
      )
        .select("-_id geoId geographicLevel")
        // .populate({ path: "_census" })
        .lean()
        .exec()

      // console.log("regionData ==> ", regionData)

      /* Compute arguments to be passed to Python script: */
      const blockGeoIds = regionData.filter((r) => r.geographicLevel === "Blocks").map(({ geoId }) => geoId).join("|")
      if (blockGeoIds.length === 0) return res.status(200).json({ error: false, censusData: [] })

      const cbgGeoIds = regionData.filter((r) => r.geographicLevel === "Block Group").map(({ geoId }) => geoId)
      if (cbgGeoIds.length === 0) return res.status(200).json({ error: false, censusData: [] })
      // console.log("cbgGeoIds ==> ", cbgGeoIds)
      const cbgDocuments = await Census.find({
        geoId: { $in: cbgGeoIds }
      })
        // .select("-censusBlocks")
        .lean()
        .exec()
      // console.log("cbgDocuments[0] ==> ", JSON.stringify(cbgDocuments.slice(0, 1), null, 2))

      /* Write the arguments to temp files [TBD] */
      await fs.mkdir(`./tmp/${reqId}`) // first, create an unique tmp folder
      await Promise.all([
        fs.writeFile(`./tmp/${reqId}/cbgDocuments.json`, JSON.stringify(cbgDocuments)),
        fs.writeFile(`./tmp/${reqId}/blockGeoids.json`, blockGeoIds),
      ])

      const { stdout: censusData } = await execa(
        process.env.PYTHON_EXE_PATH,
        [
          process.env.CENSUS_AGGREGATOR_SCRIPT_PATH,
          // JSON.stringify(cbgDocuments),
          `./tmp/${reqId}/cbgDocuments.json`,
          // blockGeoIds
          `./tmp/${reqId}/blockGeoids.json`
        ]
      )
      return res.status(200).json({ error: false, censusData })
    } catch (err) {
      req.logger.error(err)
      return res.status(500).json({ error: true, message: err.message.slice(0, 1000) }) // error msg from python script failures may be extremely long, so slicing it
    } finally {
      // await rimraf(`./tmp/${reqId}`) // delete the tmp folder
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
