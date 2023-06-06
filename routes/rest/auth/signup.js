const User = require("../../../models/user")

module.exports = {
  /**
   *
   * @api {post} /signup User registration
   * @apiName userRegistration
   * @apiGroup User
   * @apiVersion  1.0.0
   * @apiPermission Public
   *
   * @apiParam (Request Body) {email} email Enter email in proper format
   * @apiParam (Request Body) {String} phone Enter phone number
   * @apiParam (Request Body) {Object} name Enter name is a object type
   * @apiParam (Request Body) {String} name.first Enter first name is a string type
   * @apiParam (Request Body) {String} name.last Enter last name is a string type
   * @apiParam (Request Body) {String} password Enter password
   *
   *
   * @apiParamExample  {json} Request-Example:
   * {
   *     "email" : "achintya@aggregateintelligence.in",
   *     "phone" : "9614450410",
   *     "name"  :{
   *          "first":"Achintya",
   *          "last" :"Mondal"
   *      }
   * }
   *
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
   *     "error" : false,
   *     "user" : {
   *          "email" : "achintya@aggregateintelligence.in",
   *          "phone" : "9614450410",
   *          "name"  :{
   *              "first":"Achintya",
   *              "last" :"Mondal"
   *           }
   *      }
   * }
   */
  async post(req, res) {
    try {
      const {
        email, phone, name, password
      } = req.body
      if (email === undefined) {
        return res
          .status(400)
          .json({ error: true, reason: "Field 'email' is mandatroy !!!" })
      }
      if (name === undefined || typeof (name.first) !== "string" || name.first.trim() === "") {
        return res
          .status(400)
          .json({ error: true, reason: "Field 'first' must be valid string !!!" })
      }
      if (name === undefined || typeof (name.last) !== "string" || name.last.trim() === "") {
        return res
          .status(400)
          .json({ error: true, reason: "Field 'last' must be valid string !!!" })
      }
      if (typeof (password) !== "string" || password.trim() === "") {
        return res
          .status(400)
          .json({ error: true, reason: "Field 'password' must be valid string !!!" })
      }
      const emailCheck = await User.findOne({ email })
      if (emailCheck !== null) {
        return res.status(400).json({ error: true, reason: "Email Id already exist" })
      }
      let user = await User.create({
        email,
        phone,
        password,
        name
      })
      user = user.toObject()
      delete user.password
      delete user.forgotpassword

      return res.status(200).json({ error: false, user })
    } catch (err) {
      return res.status(500).json({ error: true, reason: err.message })
    }
  }
}
