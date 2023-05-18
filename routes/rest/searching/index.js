const mongoose = require("mongoose")
const Region = require("../../../models/regions")

module.exports = {
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
      return res.status(200).json({ error: false, data: regionData })
    } catch (err) {
      return res.status(500).json({ error: true, message: err.message })
    }
  },

  async driveTime(req, res) {
    try {
      return 0
    // eslint-disable-next-line no-unreachable
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

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

  async regions(req, res) {
    const {
      page = 1, size = 10, geoLevel, name
    } = req.query
    console.log("req.query ==> ", req.query)
    try {
      if (name.trim() === "") {
        return res.status(400).json({ error: true, message: "Field 'name' not valid format!!!" })
      }
      const query = { $text: { $search: name } }

      const paginationOptions = {
        page,
        limit: size,
        geographicLevel: geoLevel,
        sort: { _id: -1 }
      }
      console.log("paginationOptions ==> ", paginationOptions)
      const { docs, totalDocs, totalPages } = await Region.paginate(
        query,
        paginationOptions
      )
      // console.log("docs ==> ", docs)

      return res.status(200).json(
        {
          error: false,
          regions: docs,
          totalData: totalDocs,
          totalPages,
          page,
          size
        }
      )
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

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
      return res.status(200).json({ error: false, data: searchRegionData })
    } catch (error) {
      return res.status(500).json({ message: "Server error" })
    }
  },

  async customfile(req, res) {
    try {
      return 0
    // eslint-disable-next-line no-unreachable
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
