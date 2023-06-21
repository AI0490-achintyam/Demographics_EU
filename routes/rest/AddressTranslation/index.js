// const region = require("../../../models/regions")

module.exports = {

  /**
   * @api {get} /geocoding Get Coordinates
   * @apiName Get Coordinates
   * @apiGroup Address Translation
   * @apiVersion  1.0.0
   * @apiPermission User
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiQuery {String} addressName Enter address to search
   *
   * @apiSuccessExample {json} Success-Response:200
   *   {
            "error": false,
            "regions": [
            {}
            ]
    */
  async getCoordinates(req, res) {
    try {
      const { address } = req.query
      const response = await fetch(`${process.env.MAPBOX_GEOCODING_URL} ${address}.json?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const data = await response.json()

      const output = data.features.map((p) => ({
        placeName: p.place_name,
        longitude: p.center[0],
        latitude: p.center[1]
      }))

      return res.status(200).json({ error: false, data: output })
    } catch (error) {
      return res.status(500).json({ error: true, message: "Address translation not found" })
    }
  }
}
