const execa = require("execa")
const { rimraf } = require("rimraf")
const fs = require("node:fs/promises")
const cuid = require("cuid")
const Reference = require("../../../models/reference")
const Census = require("../../../models/census")
const Region = require("../../../models/regions")

module.exports = {

  /**
   *
   * @api {post} /demographicsData/drivetime DriveTime Search
   * @apiName DriveTimeSearch
   * @apiGroup Demographics Data
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiBody {Number} long Enter longitude of the given point
   * @apiBody {Number} lat Enter latitude of the given point
   * @apiBody {Number} range Enter range in terms of meters
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
      if (isNaN(Number(minutes)) || minutes > 60 || minutes <= 0) {
        return res.status(400).json({ error: true, message: "Field 'minutes' must be a positive number less than 60!!" })
      }
      const { censusAttributes, censusCategory } = req.body

      if (censusAttributes === undefined && censusCategory === undefined) return res.status(400).json({ error: true, message: "At least one of censusAttributes or censusCategory must be specified!" })

      const urlBase = process.env.MAPBOX_DRIVETIME_URL

      const response = await fetch(`${urlBase}driving/${long},${lat}?contours_minutes=${minutes}&polygons=true&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`)
      if (!response.ok) {
        throw new Error("Error retrieving data")
      }
      const { features } = await response.json()

      const blocks = await Region.find({
        geographicLevel: "Blocks",
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

      if (Array.isArray(censusAttributes)) {
        references = await Reference.find({ attribute: { $in: censusAttributes } }).lean().exec()
      } else if (typeof censusCategory === "string") {
        references = await Reference.find({ category: censusCategory }).lean().exec()
      }

      const chosenAttributes = references.map(({ attribute }) => attribute) // .join("|")
      if (chosenAttributes.length === 0) return res.status(400).json({ error: true, message: "Please sepecify some valid census attributes!" })

      /* Compute arguments to be passed to Python script: */
      const blockGeoIds = blocks.map(({ geoId }) => geoId).join("|")
      if (blockGeoIds.length === 0) return res.status(200).json({ error: false, censusData: [] })

      // const cbgGeoIds = blocks.filter((r) => r.geographicLevel === "Block Group").map(({ geoId }) => geoId)
      const cbgGeoIds = [...new Set(blocks.map(({ geoId }) => geoId.substring(0, 12)))]
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

      let censusData = JSON.parse(sanitizedOutput)
      if (censusCategory !== undefined) {
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
      }
      return res.status(200).json({ error: false, censusData })
      // return res.status(200).json({ error: false, censusData: JSON.parse(sanitizedOutput) })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message.slice(0, 1000) }) // error msg from python script failures may be extremely long, so slicing it
    } finally {
      await rimraf(`./tmp/${reqId}`) // delete the tmp folder
    }
  }
}
