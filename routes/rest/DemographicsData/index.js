const execa = require("execa")
const { rimraf } = require("rimraf")
const fs = require("fs")
const Region = require("../../../models/regions")

module.exports = {
  /**
   *
   * @api {get} /search/customfile Shape file upload
   * @apiName shapeFile
   * @apiGroup Searching
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

  async byCustomPolygon(req, res) {
    try {
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  async byGeoId(req, res) {
    try {
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  async byRadius(req, res) {
    try {
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  async byDriveTime(req, res) {
    try {
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
