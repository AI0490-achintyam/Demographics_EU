const execa = require("execa")
const geojsonArea = require("@mapbox/geojson-area")
const { rimraf } = require("rimraf")
const fs = require("node:fs/promises")
const cuid = require("cuid")
const Joi = require("joi")
const { readFile } = require("node:fs/promises")

const { miles2meters } = require("../../../lib/radiusConvert")

const Census = require("../../../models/census")
const Region = require("../../../models/regions")
const Reference = require("../../../models/reference")

module.exports = {
  /**
   *
   * @api {post} /demographicsData/geojson GeoJson
   * @apiName GeoJSONSearch
   * @apiGroup Demographics Data
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiBody {file} rdocs Either enter file of type geojson or json
   * @apiBody {json} geojson Or Enter json object
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
    const { geojson } = req.body

    try {
      let jObj
      if (rdocs) {
        const fExt = rdocs.originalname?.split(".")?.pop()?.toLowerCase() // the extension of the uploaded file
        if (!["json", "geojson"].includes(fExt)) {
          return res.status(400).json({ error: true, message: "Only files with .json or .geojson extensions are supported!" })
        }

        try {
          const jStr = await readFile(rdocs.path)
          jObj = JSON.parse(jStr)
        } catch (fileParseErr) {
          req.logger.error(fileParseErr)
          return res.status(400).json({ error: true, message: "Please make sure that you are uploading a valid json file!" })
        }
        if (!jObj) return res.status(400).json({ error: true, message: "Unable to parse uploaded file!" })
      } else if (geojson !== undefined) {
        jObj = geojson
      } else {
        return res.status(400).json({ error: true, reason: "Either upload a geojson file or provide geojson object in req body" })
      }

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

      const [{ geometry }] = jObj.features
      const computedArea = geojsonArea.geometry(geometry) // in square meters
      if (computedArea === 0) return res.status(400).json({ error: true, message: "Geojson polygon specified has zero area! Is it a closed polygon?" })
      const cutOffArea = (miles2meters(process.env.CUTOFF_BIGRADIUS_MILES || 50) ** 2) * Math.PI // in square meters

      const isBig = computedArea > cutOffArea

      const { censusAttributes, censusCategory } = req.body

      if (censusAttributes === undefined && censusCategory === undefined) return res.status(400).json({ error: true, message: "At least one of censusAttributes or censusCategory must be specified!" })

      // const geographicLevel = isBig === true
      //   ? { $in: ["Block Group"] }
      //   : { $in: ["Blocks", "Block Group"] }

      const blocks = await Region.find({
        geographicLevel: "Blocks",
        centroid: {
          $geoWithin: {
            $geometry: geometry
          }
        }
      })
        .select("-_id geoId name geographicLevel")
        .lean()
        .exec()

      let references = []

      if (Array.isArray(censusAttributes)) {
        references = await Reference.find({ attribute: { $in: censusAttributes } }).lean().exec()
      } else if (typeof censusCategory === "string") {
        references = await Reference.find({ category: censusCategory }).lean().exec()
      }
      const chosenAttributes = references.map(({ attribute }) => attribute) // .join("|")
      if (chosenAttributes.length === 0) return res.status(400).json({ error: true, message: "Please specify some valid census attributes!" })

      /* Compute arguments to be passed to Python script: */
      const blockGeoIds = isBig === true
        ? []
        : blocks.map(({ geoId }) => geoId) // .join("|")
      if (blockGeoIds.length === 0) return res.status(200).json({ error: false, censusData: [] })

      // const cbgGeoIds = blocks.filter((r) => r.geographicLevel === "Block Group").map(({ geoId }) => geoId)
      const cbgGeoIds = [...new Set(blocks.map(({ geoId }) => geoId.substring(0, 12)))]
      if (cbgGeoIds.length === 0) return res.status(200).json({ error: false, censusData: [] })

      const selectFields = isBig === true
        ? [
          "geoId",
          "censusAttributes.B01003_E001",
          "censusAttributes.B11001_E001",
          "censusAttributes.B25001_E001",
          "censusAttributes.B01003_M001",
          "censusAttributes.B11001_M001",
          "censusAttributes.B25001_M001",
          ...chosenAttributes.map((att) => `censusAttributes.${att}`)
        ]
        : [
          "geoId",
          "censusBlocks",
          "censusAttributes.B01003_E001",
          "censusAttributes.B11001_E001",
          "censusAttributes.B25001_E001",
          "censusAttributes.B01003_M001",
          "censusAttributes.B11001_M001",
          "censusAttributes.B25001_M001",
          ...chosenAttributes.map((att) => `censusAttributes.${att}`)
        ]

      const cbgDocuments = await Census.find({
        geoId: { $in: cbgGeoIds }
      })
        .select(selectFields)
        .lean()
        .exec()

      await fs.mkdir(`./tmp/${reqId}`, { recursive: true }) // first, create an unique tmp folder

      const fileCreationPromises = [
        fs.writeFile(`./tmp/${reqId}/cbgDocuments.json`, JSON.stringify(cbgDocuments)),
        fs.writeFile(`./tmp/${reqId}/attributes.txt`, chosenAttributes.join("|"))
      ]
      if (isBig !== true) {
        fileCreationPromises.push(
          fs.writeFile(`./tmp/${reqId}/blockGeoids.txt`, blockGeoIds.join("|")),
        )
      }

      await Promise.all(fileCreationPromises)

      const scriptArgs = isBig === true
        ? [process.env.CENSUS_AGGREGATOR_SCRIPT_PATH_BIGRADIUS]
        : [process.env.CENSUS_AGGREGATOR_SCRIPT_PATH]
      scriptArgs.push(`./tmp/${reqId}/cbgDocuments.json`)

      if (isBig !== true) scriptArgs.push(`./tmp/${reqId}/blockGeoids.txt`)
      scriptArgs.push(`./tmp/${reqId}/attributes.txt`)
      const { stdout } = await execa(process.env.PYTHON_EXE_PATH, scriptArgs)

      const sanitizedOutput = stdout.replace(/NaN/g, "null") // remove NaN values (coming from Python?)

      let censusData = JSON.parse(sanitizedOutput)

      censusData = Object.keys(censusData).reduce((acc, cur) => {
        const foundRef = references.find((r) => r.attribute === cur)
        if (foundRef === undefined) return acc // filter unneccessery record

        const keySplit = cur.split("_")
        if (keySplit[1].startsWith("E")) {
          const moeKey = `${keySplit[0]}_${keySplit[1].replace(/^E/, "M")}`
          const record = {
            name: foundRef?.name,
            universe: foundRef?.universe,
            censusCategory: foundRef?.category,
            attribute: cur,
            value: censusData[cur],
          }
          if (censusData[moeKey] !== undefined) record.moE = censusData[moeKey]
          acc.push(record)
        }
        return acc
      }, [])

      return res.status(200).json({ error: false, censusData })
      // return res.status(200).json({ error: false, censusData: JSON.parse(sanitizedOutput) })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message.slice(0, 1000) }) // error msg from python script failures may be extremely long, so slicing it
    } finally {
      const promises = [
        rimraf(`./tmp/${reqId}`) // delete the tmp folder
      ]
      if (rdocs !== undefined) {
        promises.push(rimraf(rdocs.path))
      }
      await Promise.all(promises)
    }
  }
}
