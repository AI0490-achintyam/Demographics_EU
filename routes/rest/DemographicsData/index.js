const execa = require("execa")
const { rimraf } = require("rimraf")
const fs = require("node:fs/promises")
const cuid = require("cuid")
const Joi = require("joi")
const { readFile } = require("node:fs/promises")
const Reference = require("../../../models/reference")

const radiusConvert = require("../../../lib/radiusConvert")

const Census = require("../../../models/census")
const Region = require("../../../models/regions")

module.exports = {

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
      const { censusAttributes, censusCategory } = req.body
      console.log("req.body ==> ", req.body)
      if (censusAttributes === undefined && censusCategory === undefined) return res.status(400).json({ error: true, message: "At least one of censusAttributes or censusCategories must be specified!" })

      let references = []
      console.time("Ref.find")
      if (Array.isArray(censusAttributes)) {
        references = await Reference.find({ attribute: { $in: censusAttributes } }).lean().exec()
      } else if (typeof censusCategory === "string") {
        references = await Reference.find({ category: censusCategory }).lean().exec()
      }

      const chosenAttributes = references.map(({ attribute }) => attribute) // .join("|")
      console.log("chosenAttributes ==> ", chosenAttributes)
      if (chosenAttributes.length === 0) return res.status(400).json({ error: true, message: "Please sepecify some valid census attributes!" })
      console.timeEnd("Ref.find")

      const censusData = await Census.find({
        geoId,
      })
        .select([
          "-_id",
          "geoId",
          "censusBlocks",
          ...chosenAttributes.map((att) => `censusAttributes.${att}`)
        ])
        .lean()
        .exec()

      console.log("censusData ==> ", censusData.geoId)
      if (censusData === null) return res.status(400).json({ error: true, message: `No such geo id ${geoId}` })

      return res.status(200).json({ error: false, censusData })
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

      const { censusAttributes, censusCategory } = req.body
      console.log("req.body ==> ", req.body)
      if (censusAttributes === undefined && censusCategory === undefined) return res.status(400).json({ error: true, message: "At least one of censusAttributes or censusCategories must be specified!" })

      // validation end..........
      console.time("Region.find")
      const regionData = await Region.find(
        {
          geographicLevel: { $in: ["Blocks", "Block Group"] },
          // geographicLevel: { $in: ["Block Group"] },
          centroid: {
            $nearSphere: {
              $geometry: { type: "Point", coordinates: [Number(long), Number(lat)] },
              $maxDistance: Number(radiusConvert.miles2meters(radius)), // convert input radius in miles to meters
            }
          }
        },
      )
        // .limit(1000)
        .select("-_id geoId geographicLevel")
        // .populate({ path: "_census" })
        .lean()
        .exec()
      console.timeEnd("Region.find")

      // console.log("regionData ==> ", regionData)

      /* Compute arguments to be passed to Python script: */
      /* argument # 3 */
      let references = []
      console.time("Ref.find")
      if (Array.isArray(censusAttributes)) {
        references = await Reference.find({ attribute: { $in: censusAttributes } }).lean().exec()
      } else if (typeof censusCategory === "string") {
        references = await Reference.find({ category: censusCategory }).lean().exec()
      }
      const chosenAttributes = references.map(({ attribute }) => attribute) // .join("|")
      if (chosenAttributes.length === 0) return res.status(400).json({ error: true, message: "Please sepecify some valid census attributes!" })
      console.timeEnd("Ref.find")

      /* argument # 2 */
      const blockGeoIds = regionData.filter((r) => r.geographicLevel === "Blocks").map(({ geoId }) => geoId) // .join("|")
      if (blockGeoIds.length === 0) return res.status(200).json({ error: false, censusData: [] })

      /* argument # 1 */
      console.time("Census.find")
      const cbgGeoIds = regionData.filter((r) => r.geographicLevel === "Block Group").map(({ geoId }) => geoId)
      if (cbgGeoIds.length === 0) return res.status(200).json({ error: false, censusData: [] })
      // console.log("cbgGeoIds ==> ", cbgGeoIds)
      const cbgDocuments = await Census.find({
        geoId: { $in: cbgGeoIds },
      })
        .select([
          "geoId",
          "censusBlocks",
          "censusAttributes.B01003_E001",
          "censusAttributes.B11001_E001",
          "censusAttributes.B25001_E001",
          "censusAttributes.B01003_M001",
          "censusAttributes.B11001_M001",
          "censusAttributes.B25001_M001",
          ...chosenAttributes.map((att) => `censusAttributes.${att}`)
        ])
        .lean()
        .exec()
      console.timeEnd("Census.find")
      console.log("cbgDocuments.length ==> ", cbgGeoIds.length, cbgDocuments.length)
      // console.log("CbgDocumentcensuss[0] ==> ", JSON.stringify(cbgDocuments.slice(0, 1), null, 2))
      // await fs.writeFile("/tmp/foo", JSON.stringify(cbgGeoIds))

      /* Write the arguments to temp files [TBD] */
      console.time("Writing files")
      await fs.mkdir(`./tmp/${reqId}`, { recursive: true }) // first, create an unique tmp folder
      await Promise.all([
        fs.writeFile(`./tmp/${reqId}/cbgDocuments.json`, JSON.stringify(cbgDocuments)),
        fs.writeFile(`./tmp/${reqId}/blockGeoids.txt`, blockGeoIds.join("|")),
        fs.writeFile(`./tmp/${reqId}/attributes.txt`, chosenAttributes.join("|"))
      ])
      console.timeEnd("Writing files")

      console.time("Running Py")
      const { stdout } = await execa(
        process.env.PYTHON_EXE_PATH,
        [
          process.env.CENSUS_AGGREGATOR_SCRIPT_PATH,
          `./tmp/${reqId}/cbgDocuments.json`,
          `./tmp/${reqId}/blockGeoids.txt`,
          `./tmp/${reqId}/attributes.txt`
        ]
      )
      console.timeEnd("Running Py")
      const sanitizedOutput = stdout.replace(/NaN/g, "null") // remove NaN values (coming from Python?)
      return res.status(200).json({ error: false, censusData: JSON.parse(sanitizedOutput) })
    } catch (err) {
      req.logger.error(err)
      return res.status(500).json({ error: true, message: err.message.slice(0, 1000) }) // error msg from python script failures may be extremely long, so slicing it
    } finally {
      await rimraf(`./tmp/${reqId}`) // delete the tmp folder
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
   *
   * @apiBody {String} [censusAttributes] Enter censusAttribute Either censusAttributes or censusCategory is mandatory
   * @apiBody {String} [censusCategory] Enter censusCategory Either censusAttributes or censusCategory is mandatory
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "regions": [
          {}
        ]
   *  }
  */

  async byDriveTime(req, res) {
    const reqId = cuid() // unique identifier for the endpoint call

    try {
      const {
        long, lat, minutes
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
      if (isNaN(Number(minutes)) || minutes > 60 || minutes <= 0) {
        return res.status(400).json({ error: true, message: "Field 'minutes' must be a positive number less than 60!!" })
      }
      const { censusAttributes, censusCategory } = req.body
      console.log("req.body ==> ", req.body)
      if (censusAttributes === undefined && censusCategory === undefined) return res.status(400).json({ error: true, message: "At least one of censusAttributes or censusCategories must be specified!" })

      const urlBase = process.env.MAPBOX_DRIVETIME_URL

      const response = await fetch(`${urlBase}driving/${long},${lat}?contours_minutes=${minutes}&polygons=true&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`)
      if (!response.ok) {
        throw new Error("Error retrieving data")
      }
      const { features } = await response.json()

      const driveTimeRes = await Region.find({
        geographicLevel: { $in: ["Blocks", "Block Group"] },
        centroid: {
          $geoWithin: {
            $geometry: features[0].geometry
          }
        }
      })
        .select("-_id geoId name geographicLevel")
        // .populate({ path: "_census" })
        .lean()
        .exec()

      let references = []
      console.time("Ref.find")
      if (Array.isArray(censusAttributes)) {
        references = await Reference.find({ attribute: { $in: censusAttributes } }).lean().exec()
      } else if (typeof censusCategory === "string") {
        references = await Reference.find({ category: censusCategory }).lean().exec()
      }

      const chosenAttributes = references.map(({ attribute }) => attribute) // .join("|")
      if (chosenAttributes.length === 0) return res.status(400).json({ error: true, message: "Please sepecify some valid census attributes!" })
      console.timeEnd("Ref.find")

      /* Compute arguments to be passed to Python script: */
      const blockGeoIds = driveTimeRes.filter((r) => r.geographicLevel === "Blocks").map(({ geoId }) => geoId).join("|")
      if (blockGeoIds.length === 0) return res.status(200).json({ error: false, censusData: [] })

      const cbgGeoIds = driveTimeRes.filter((r) => r.geographicLevel === "Block Group").map(({ geoId }) => geoId)
      if (cbgGeoIds.length === 0) return res.status(200).json({ error: false, censusData: [] })
      const cbgDocuments = await Census.find({
        geoId: { $in: cbgGeoIds },
      })
        .select([
          "geoId",
          "censusBlocks",
          // "censusAttributes.B01003_E001",
          // "censusAttributes.B11001_E001",
          // "censusAttributes.B25001_E001",
          ...chosenAttributes.map((att) => `censusAttributes.${att}`)
        ])
        .lean()
        .exec()

      await fs.mkdir(`./tmp/${reqId}`, { recursive: true }) // first, create an unique tmp folder
      await Promise.all([
        fs.writeFile(`./tmp/${reqId}/cbgDocuments.json`, JSON.stringify(cbgDocuments)),
        fs.writeFile(`./tmp/${reqId}/blockGeoids.json`, blockGeoIds),
      ])

      const { stdout } = await execa(
        process.env.PYTHON_EXE_PATH,
        [
          process.env.CENSUS_AGGREGATOR_SCRIPT_PATH,
          `./tmp/${reqId}/cbgDocuments.json`,
          `./tmp/${reqId}/blockGeoids.json`
        ]
      )
      const sanitizedOutput = stdout.replace(/NaN/g, "null") // remove NaN values (coming from Python?)
      return res.status(200).json({ error: false, censusData: JSON.parse(sanitizedOutput) })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message.slice(0, 1000) }) // error msg from python script failures may be extremely long, so slicing it
    } finally {
      await rimraf(`./tmp/${reqId}`) // delete the tmp folder
    }
  },

  /**
   *
   * @api {get} /demographicsData/geojson GeoJson
   * @apiName GeoJSONSearch
   * @apiGroup Demographics Data
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiQuery {file} geojson Enter file of type geojson or json
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "censusData": [
          {}
        ]
   *  }
  */

  async byGeoJson(req, res) {
    const reqId = cuid() // unique identifier for the endpoint call
    const rdocs = req.file // the uploaded file
    try {
      const fExt = rdocs.originalname?.split(".")?.pop()?.toLowerCase() // the extension of the uploaded file
      if (!["json", "geojson"].includes(fExt)) {
        return res.status(400).json({ error: true, message: "Only files with .json or .geojson extensions are supported!" })
      }

      let jObj
      try {
        const jStr = await readFile(rdocs.path)
        jObj = JSON.parse(jStr)
      } catch (fileParseErr) {
        req.logger.error(fileParseErr)
        return res.status(400).json({ error: true, message: "Please make sure that you are uploading a valid json file!" })
      }
      if (!jObj) return res.status(400).json({ error: true, message: "Unable to parse uploaded file!" })

      // validate as geojson:
      const schema = Joi.object().keys({
        type: Joi.string().required().valid("FeatureCollection"),
        features: Joi.array().length(1).required().items(
          Joi.object().keys({
            type: Joi.string().required().valid("Feature"),
            geometry: Joi.object().required().keys({
              type: Joi.string().required().valid("Polygon"),
              coordinates: Joi.array().items(
                Joi.array().items(
                  Joi.array().length(2).items().ordered(
                    Joi.number().min(-180).max(180), // Longitude
                    Joi.number().min(-90).max(90) // Latitude
                  )
                )
              )
            })
          }).unknown()
        )
      }).unknown()
      try {
        await schema.validateAsync(jObj)
      } catch (joiErr) {
        req.logger.error(joiErr)
        return res.status(400).json({ error: true, message: "Please upload valid GeoJSON data with a single feature whose geometry type is a Polygon!" })
      }

      const regions = await Region.find({
        geographicLevel: { $in: ["Blocks", "Block Group"] },
        centroid: {
          $geoWithin: {
            $geometry: jObj.features[0].geometry
          }
        }
      })
        .select("-_id geoId name geographicLevel")
        .lean()
        .exec()

      /* Compute arguments to be passed to Python script: */
      const blockGeoIds = regions.filter((r) => r.geographicLevel === "Blocks").map(({ geoId }) => geoId).join("|")
      if (blockGeoIds.length === 0) return res.status(200).json({ error: false, censusData: [] })

      const cbgGeoIds = regions.filter((r) => r.geographicLevel === "Block Group").map(({ geoId }) => geoId)
      if (cbgGeoIds.length === 0) return res.status(200).json({ error: false, censusData: [] })
      const cbgDocuments = await Census.find({
        geoId: { $in: cbgGeoIds }
      })
        .lean()
        .exec()
      await fs.mkdir(`./tmp/${reqId}`, { recursive: true }) // first, create an unique tmp folder
      await Promise.all([
        fs.writeFile(`./tmp/${reqId}/cbgDocuments.json`, JSON.stringify(cbgDocuments)),
        fs.writeFile(`./tmp/${reqId}/blockGeoids.json`, blockGeoIds),
      ])

      const { stdout } = await execa(
        process.env.PYTHON_EXE_PATH,
        [
          process.env.CENSUS_AGGREGATOR_SCRIPT_PATH,
          `./tmp/${reqId}/cbgDocuments.json`,
          `./tmp/${reqId}/blockGeoids.json`
        ]
      )
      const sanitizedOutput = stdout.replace(/NaN/g, "null") // remove NaN values (coming from Python?)
      return res.status(200).json({ error: false, censusData: JSON.parse(sanitizedOutput) })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message.slice(0, 1000) }) // error msg from python script failures may be extremely long, so slicing it
    } finally {
      await Promise.all([
        rimraf(rdocs.path), // delete the uploaded json file
        rimraf(`./tmp/${reqId}`) // delete the tmp folder
      ])
    }
  }
}
