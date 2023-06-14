// const region = require("../../../models/regions")

module.exports = {

  /**
   * @api {get} /AddressTranslation/getcordinates Get Coordinates
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
      return res.status(501).send("Not Implemented!")
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
