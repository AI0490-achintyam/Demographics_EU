const execa = require("execa")
const { rimraf } = require("rimraf")
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
      if (isNaN(long)) {
        return res.status(400).json({ error: true, message: "Field 'long' not valid format!!!" })
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(lat)) {
        return res.status(400).json({ error: true, message: "Field 'lat' not valid format!!!" })
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(rad)) {
        return res.status(400).json({ error: true, message: "Field 'rad' not valid format!!!" })
      }
      // validation end..........

      const regionData = await Region.find(
        {
          geometry: {
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
      return res.status(501).send("Not Implemented!")
    } catch (error) {
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
    try {
      const msa = await Region.findOne({
        geoId,
        geographicLevel: "MSA"
      }).exec()

      if (msa === null) return res.status(400).json({ error: true, message: `No such MSA with geo id ${geoId}` })

      const regionsWithinMsa = await Region.find({
        geographicLevel: {
          $in: [
            "Tract", "Block Group", "Blocks"
          ]
        },
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
            $geometry: zipcode.geometry
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
      if (isNaN(long)) {
        return res.status(400).json({ error: true, message: "Field 'long' not valid format!!!" })
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(lat)) {
        return res.status(400).json({ error: true, message: "Field 'lat' not valid format!!!" })
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

  async customfile(req, res) {
    try {
      const rdocs = req.file
      console.log("rdocs ==> ", rdocs)
      if (rdocs.originalname.split(".").filter(Boolean).slice(1).join(".") !== "shp") {
        await rimraf(rdocs.path)
        return res.status(400).json({ error: true, message: "Only .shp file extension support" })
      }
      if (process.env.SHAPE_RESTORE_SHX === "YES") {
        const stdout = await execa("ogr2ogr", ["-f", "GeoJSON", `public/geojsonoutput/op-${new Date().getTime()}.geojson`, `public/uploads/rdoc/${rdocs.rdoc}`])
        // console.log("stdout ==> ", stdout)
      }
      const output = `/home/ai/DemographicsAPI/public/uploads/rdoc/${rdocs.rdoc}`
      // console.log("output ==> ", output)
      return res.status(200).json({ error: true, message: "File inserted successfully" })
      // let { data } = await ogr2ogr("/public/upload/rdoc/to/spatial/file")
      // console.log(data)
    } catch (error) {
      // console.log("error ==> ", error)
      return res.status(500).json({ error: true, message: error.message })
    }
  },

}
