const execa = require("execa")
const { rimraf } = require("rimraf")
const fs = require("fs")
const Openrouteservice = require("openrouteservice-js")
const Region = require("../../../models/regions")

module.exports = {

  /**
   *
   * @api {get} /search/radius Radius Search
   * @apiName Search radius
   * @apiGroup Searching
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
          centroid: {
            $nearSphere: {
              $geometry: { type: "Point", coordinates: [parseFloat(long), parseFloat(lat)] },
              $maxDistance: parseFloat(rad),
            }
          }
        },
      ).exec()
      return res.status(200).json({ error: false, regions: regionData })
    } catch (err) {
      return res.status(500).json({ error: true, message: err.message })
    }
  },

  /**
   *
   * @api {get} /search/drivetime Drive time Search
   * @apiName Search driveTime
   * @apiGroup Searching
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
      console.log("long ==> ", Number(long), typeof long)
      // const Isochrones = new Openrouteservice.Isochrones({ api_key: process.env.DIRECTION_API_KEY })
      const Isochrones = new Openrouteservice.Isochrones({ api_key: process.env.DIRECTION_API_KEY, host: "http://localhost:8080/ors" })
      console.log("Isochrones ==> ", Isochrones)
      const { features } = await Isochrones.calculate({
        locations: [[Number(long), Number(lat)]],
        profile: "driving-car",
        range: [Number(range)],
        range_type: "time"
      })
      console.log("features ==> ", features)

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
   * @api {get} /search/msa Search msa
   * @apiName Search msa
   * @apiGroup Searching
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
    console.log("geoId ==> ", geoId)

    try {
      const msa = await Region.findOne({
        geoId,
        geographicLevel: "MSA"
      }).exec()

      if (msa === null) return res.status(400).json({ error: true, message: `No such MSA with geo id ${geoId}` })

      const regionsWithinMsa = await Region.find({
        geographicLevel: "MSA",
        centroid: {
          $geoWithin: {
            $geometry: msa.toObject().geometry
          }
        }
      }).exec()
      return res.status(200).json({ error: false, regions: regionsWithinMsa })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   *
   * @api {get} /search/zipcode Search zipcode
   * @apiName Search zipcode
   * @apiGroup Searching
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

        geographicLevel: {
          $in: [
            "Tract", "Block Group", "Blocks"
          ]

        },
        centroid: {
          $geoWithin: {
            $geometry: zipcode.toObject().geometry
          }
        }
      }).exec()
      return res.status(200).json({ error: false, regions: regionsWithinZipcode })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   * @api {get} /regions Regions Search
   * @apiName regionSearch
   * @apiGroup Searching
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiQuery {Number} geoId Enter geoId of the given point
   * @apiQuery {Number}[page=1] Enter page number, default value is 1
   * @apiQuery {Number}[size=10] Enter size of data, default value is 10
   *
   * @apiSuccessExample {json} Success-Response:200
   *   {
            "error": false,
            "regions": [
            {}
            ]
    */

  async regions(req, res) {
    const {
      geographicLevel, name, page = 1, size = 10
    } = req.query

    try {
      if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: true, message: "Field 'name' not valid format!!!" })
      }
      const query = { $text: { $search: name } }

      if (geographicLevel !== undefined) {
        if (typeof geographicLevel === "string" && ["Country", "State", "County", "Tract", "Block Group", "Blocks", "Places", "MSA", "Zipcode", "msaType"].includes(geographicLevel)) {
          query.geographicLevel = geographicLevel
        } else {
          return res.status(400).json({ error: true, message: "Field 'geographicLevel' not found !!!" })
        }
      }

      const paginationOptions = {
        page,
        limit: size,
        populate: [{ path: "_census" }],
        sort: { _id: -1 }
      }
      const { docs } = await Region.paginate(
        query,
        paginationOptions
      )

      return res.status(200).json(
        {
          error: false,
          regions: docs,
        }
      )
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  /**
   *
   * @api {get} /search/point Point Search
   * @apiName point radius
   * @apiGroup Searching
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
        geometry: {
          $geoIntersects: {
            $geometry: searchPoint
          },
        },
      }).exec()
      return res.status(200).json({ error: false, regions: searchRegionData })
    } catch (error) {
      return res.status(500).json({ message: "Server error" })
    }
  },

  /**
   *
   * @api {get} /search/customfile Upload shape file
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
  async customfile(req, res) {
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

}
