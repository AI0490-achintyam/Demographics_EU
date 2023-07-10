const execa = require("execa")
const { rimraf } = require("rimraf")
const fs = require("node:fs/promises")
const cuid = require("cuid")
const Joi = require("joi")
const { readFile } = require("node:fs/promises")

const Census = require("../../../models/census")
const Region = require("../../../models/regions")

module.exports = {
  /**
   *
   * @api {get} /demographicsData/geojson GeoJson
   * @apiName GeoJSONSearch
   * @apiGroup Demographics Data
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiBody {file} geojson Enter file of type geojson or json
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
        console.log("fExt ==> ", fExt)
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
