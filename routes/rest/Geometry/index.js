const Region = require("../../../models/regions")

module.exports = {
  /**
   *
   * @api {get} /geometry/{geoId} Search By GeoId
   * @apiName searchByGeoId
   * @apiGroup Geometry
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.  yyyy.zzzz"
   *
   * @apiQuery {String} GeoId Enter geoId
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
    "error": false,
    "_id": "6489823a055b425a5d9c4e65",
    "geoId": "01",
    "name": "Alabama, USA",
    "geographicLevel": "State",
    "geometry": {
        "type": "Polygon",
        "coordinates": [
            [
              [
                    -85.488298,
                    30.997064
              ],
              [
                  -85.489167,
                  30.997051
              ],
            ]
        ]
    }
}
  */
  async searchByGeoId(req, res) {
    try {
      const { geoId } = req.params

      const geometry = await Region.findOne({
        geoId
      })
        .select("-_id geoId name geographicLevel geometry")
        .lean()
        .exec()

      if (geometry === null) return res.status(400).json({ error: true, message: `No such geo id ${geoId}` })

      return res.status(200).json({ error: false, ...geometry })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
}
