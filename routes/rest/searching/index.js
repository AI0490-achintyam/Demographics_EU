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
      return res.status(200).json({ success: true, msg: "All data for given radius", data: regionData })
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
    try {
      return 0
    // eslint-disable-next-line no-unreachable
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  async zipcode(req, res) {
    try {
      return 0
    // eslint-disable-next-line no-unreachable
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  async regions(req, res) {
    try {
      return 0
    // eslint-disable-next-line no-unreachable
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  async point(req, res) {
    try {
      return 0
    // eslint-disable-next-line no-unreachable
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },

  async customfile(req, res) {
    try {
      return 0
    // eslint-disable-next-line no-unreachable
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
}