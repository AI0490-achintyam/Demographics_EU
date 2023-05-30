const mongoose = require("mongoose")
const Region = require("../../../models/regions")

module.exports = {

  /**
   *
   * @api {get} /region/:id Get Region
   * @apiName getregionById
   * @apiGroup Region
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiParam {String} _id Enter _id of the given region
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
        "error": false,
        "regions": {}
   *  }
  */
  async get(req, res) {
    const { id } = req.params
    try {
      if (mongoose.isObjectIdOrHexString(id) === false) return res.status(400).json({ error: true, message: "Field 'id' must be a vaild  regionId!!" })

      const regionData = await Region.findOne({
        _id: id
      })

      if (!regionData) {
        return res.status(404).send("Region not found")
      }
      return res.status(200).json({ error: false, region: regionData })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
