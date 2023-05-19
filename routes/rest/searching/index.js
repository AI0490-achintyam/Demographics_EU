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
      geographicLevel, name
    } = req.query

    try {
      if (name.trim() === "") {
        return res.status(400).json({ error: true, message: "Field 'name' not valid format!!!" })
      }
      const query = { $text: { $search: name } }

      if (geographicLevel !== undefined) {
        if (typeof geographicLevel === "string" || ["Country", "State", "County", "Tract", "Block Group", "Blocks", "Places", "MSA", "Zipcode", "msaType"].includes(geographicLevel)) {
          query.geographicLevel = geographicLevel
        } else {
          return res.status(400).json({ error: true, message: "Field 'geographicLevel not found !!!" })
        }
      }

      const paginationOptions = {
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
