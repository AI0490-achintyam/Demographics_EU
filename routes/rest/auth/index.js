const jwt = require("jsonwebtoken")

const User = require("../../../models/user")

module.exports = {
  /**
   *
   * @api {post} /login User login
   * @apiName userLogin
   * @apiGroup User
   * @apiVersion  1.0.0
   * @apiPermission user
   *
   * @apiBody  {String} handle Enter user's email
   * @apiBody  {String} password Enter user's password
   *
   * @apiParamExample  {json} Request-Example:
   * {
   *     "handle" : "achintya@aggregateintelligence.in",
   *     "password" : "123456"
   * }
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
   *     "error" : false,
   *     "handle" : "achintya@aggregateintelligence.in",
   *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0N2VlYTQxODYzZmJiYmNkMGM0OGJlNCIsIl9pZCI6IjY0N2VlYTQxODYzZmJiYmNkMGM0OGJlNCIsImZ1bGxOYW1lIjoiQWNoaW50eWEgTW9uZGFsIiwiZW1haWwiOiJnb3BhbEBhZ2dyZWdhdGVpbnRlbGxpZ2VuY2UuaW4iLCJwaG9uZSI6Ijk2MTQ0NTA0MTAiLCJpYXQiOjE2ODYwMzk0OTksImV4cCI6MTY4ODYzMTQ5OX0.LL_biJnTVu1UNO5cP4pFokFSqSjpkOkzoxc9tHgMVX"
   * }
   */

  async post(req, res) {
    try {
      // const { type } = req.params
      const { handle, password } = req.body

      if (handle === undefined || password === undefined) {
        return res.status(400).json({
          error: true,
          reason: "Fields 'handle' or 'password' are mandatory"
        })
      }
      const user = await User.findOne({
        $or: [{ email: handle.toLowerCase() }, { phone: handle }]
      }).exec()
      if (user === null) throw new Error("User Not Found")
      if (user.isActive === false) throw new Error("User Inactive")
      // check pass
      await user.comparePassword(password)
      // No error, send jwt
      const payload = {
        id: user._id,
        _id: user._id,
        fullName: user.name.full,
        email: user.email,
        phone: user.phone
      }
      const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: 3600 * 24 * 30 // 1 month
      })
      return res.json({ error: false, handle, token })
    } catch (err) {
      return res.status(500).json({ error: true, reason: err.message })
    }
  }
}
