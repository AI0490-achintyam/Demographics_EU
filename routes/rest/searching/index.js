const mongoose = require("mongoose")
const Region = require("../../../models/regions")

module.exports = {
  async radiusSearch(req, res) {
    const { long, lat, rad } = req.query
    console.log("req.query ==> ", req.query)
    try {
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
      // console.log("demoData ==> ", regionData)
      return res.status(200).json({ success: true, msg: "All data for given radius", data: regionData })
    } catch (error) {
      // console.log("error ==> ", error)
      return res.status(500).json({ message: "Server error" })
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