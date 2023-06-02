const express = require("express")
const router = express.Router()

const { expressjwt } = require("express-jwt")
const multer = require("multer")
const fs = require("fs")
const cuid = require("cuid")

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = cuid() // Generate a unique folder name using the current timestamp
    const destination = `public/upload/rdoc/${folderName}`
    // Create the destination folder if it doesn't exist
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination)
    }
    cb(null, destination) // Set the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    const fileExtension = file.originalname.split(".").pop()// Get the file extension
    // eslint-disable-next-line prefer-template
    cb(null, Date.now() + "-" + file.fieldname + "." + fileExtension) // Set the file name with extension
  }
})
const upload = multer({ storage })

// const checkJwt = expressjwt({ secret: process.env.SECRET, algorithms: ["HS256"] }) // the JWT auth check middleware

const login = require("./auth")
// const signup = require("./auth/signup")
// const forgotpassword = require("./auth/password")
const users = require("./users")

const searching = require("./searching")
const region = require("./region")
const census = require("./census")
const references = require("./references")
// const geoJsonmiddleware = require("../middleware/geoJsonMiddleware")
// const shpToGeojsonmiddleware = require("../middleware/shpToGeojsonmiddleware")

router.post("/login", login.post) // UNAUTHENTICATED
// router.post("/signup", signup.post) // UNAUTHENTICATED
// router.post("/forgotpassword", forgotpassword.startWorkflow) // UNAUTHENTICATED; AJAX
// router.post("/resetpassword", forgotpassword.resetPassword) // UNAUTHENTICATED; AJAX

// router.all("*", checkJwt) // use this auth middleware for ALL subsequent routes

// router.get("/users", users.find)
// router.get("/user/:id", users.get)
// router.post("/user", users.post)
// router.put("/user/:id", users.put)
// router.delete("/user/:id", users.delete)

// Search list of searching routes ...................
router.get("/search/radius", searching.radiusSearch)
router.get("/search/drivetime/:geoId", searching.driveTime)
router.get("/search/msa/:geoId", searching.msa)
router.get("/search/zipcode/:geoId", searching.zipcode)
router.get("/regions", searching.regions)
router.get("/search/point", searching.point)
router.post("/search/customfile", upload.single("rdocs"), searching.customfile)
// router.get("/search/customfile", upload, searching.customfile)

// Search particular regions data.................
router.get("/region/:id", region.get)

// Search particular census data.................
router.get("/census/:geoid", census.get)

// Search list of  references.................
router.get("/references/censusattributes", references.censusattributes)
router.get("/references/years", references.years)
router.get("/references/msa", references.msa)
router.get("/references/forecastyears", references.forecastYears)

module.exports = router
