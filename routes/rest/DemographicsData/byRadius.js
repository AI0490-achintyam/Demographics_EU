const execa = require("execa")
const { rimraf } = require("rimraf")
const fs = require("node:fs/promises")
const cuid = require("cuid")
const Reference = require("../../../models/reference")

const radiusConvert = require("../../../lib/radiusConvert")

const Census = require("../../../models/census")
const Region = require("../../../models/regions")

module.exports = {

  /**
   *
   * @api {post} /demographicsData/radius Search By radius
   * @apiName searchByradius
   * @apiGroup Demographics Data
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiBody {Number} long Enter longitude of the given point
   * @apiBody {Number} lat Enter latitude of the given point
   * @apiBody {Number} rad Enter scaler distance/radius in terms of meters
   *
   * @apiBody {String} [censusAttributes] Enter censusAttribute Either censusAttributes or censusCategory is mandatory
   * @apiBody {String} [censusCategory] Enter censusCategory Either censusAttributes or censusCategory is mandatory
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
        } = req.body
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

      if (censusAttributes === undefined && censusCategory === undefined) return res.status(400).json({ error: true, message: "At least one of censusAttributes or censusCategories must be specified!" })

      // validation end..........
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

      /* Compute arguments to be passed to Python script: */
      /* argument # 3 */
      let references = []

      if (Array.isArray(censusAttributes)) {
        references = await Reference.find({ attribute: { $in: censusAttributes } }).lean().exec()
      } else if (typeof censusCategory === "string") {
        references = await Reference.find({ category: censusCategory }).lean().exec()
      }
      const chosenAttributes = references.map(({ attribute }) => attribute) // .join("|")
      if (chosenAttributes.length === 0) return res.status(400).json({ error: true, message: "Please sepecify some valid census attributes!" })

      /* argument # 2 */
      const blockGeoIds = regionData.filter((r) => r.geographicLevel === "Blocks").map(({ geoId }) => geoId) // .join("|")
      if (blockGeoIds.length === 0) return res.status(200).json({ error: false, censusData: [] })

      /* argument # 1 */

      const cbgGeoIds = regionData.filter((r) => r.geographicLevel === "Block Group").map(({ geoId }) => geoId)
      if (cbgGeoIds.length === 0) return res.status(200).json({ error: false, censusData: [] })

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

      // console.log("CbgDocumentcensuss[0] ==> ", JSON.stringify(cbgDocuments.slice(0, 1), null, 2))
      // await fs.writeFile("/tmp/foo", JSON.stringify(cbgGeoIds))

      /* Write the arguments to temp files [TBD] */
      await fs.mkdir(`./tmp/${reqId}`, { recursive: true }) // first, create an unique tmp folder
      await Promise.all([
        fs.writeFile(`./tmp/${reqId}/cbgDocuments.json`, JSON.stringify(cbgDocuments)),
        fs.writeFile(`./tmp/${reqId}/blockGeoids.txt`, blockGeoIds.join("|")),
        fs.writeFile(`./tmp/${reqId}/attributes.txt`, chosenAttributes.join("|"))
      ])

      const { stdout } = await execa(
        process.env.PYTHON_EXE_PATH,
        [
          process.env.CENSUS_AGGREGATOR_SCRIPT_PATH,
          `./tmp/${reqId}/cbgDocuments.json`,
          `./tmp/${reqId}/blockGeoids.txt`,
          `./tmp/${reqId}/attributes.txt`
        ]
      )

      const sanitizedOutput = stdout.replace(/NaN/g, "null") // remove NaN values (coming from Python?)
      return res.status(200).json({ error: false, censusData: JSON.parse(sanitizedOutput) })
    } catch (err) {
      req.logger.error(err)
      return res.status(500).json({ error: true, message: err.message.slice(0, 1000) }) // error msg from python script failures may be extremely long, so slicing it
    } finally {
      await rimraf(`./tmp/${reqId}`) // delete the tmp folder
    }
  }
}
