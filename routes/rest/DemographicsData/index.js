const express = require("express")
const { expressjwt } = require("express-jwt")
const multer = require("multer")
const checkJwt = expressjwt({ secret: process.env.SECRET, algorithms: ["HS256"] })

/** The Controller files */
const byGeoId = require("./byGeoId")
const byRadius = require("./byRadius")
const byDriveTime = require("./byDriveTime")
const byGeoJson = require("./byGeoJson")

const router = express.Router()

// Use the following middleware for ALL subsequent routes:
router.all("*", checkJwt) // use this auth middleware for ALL subsequent routes

// DemographicsData routes................
router.post("/bygeoid/:geoId", byGeoId.byGeoId)
router.post("/radius", byRadius.byRadius)
router.post("/drivetime", byDriveTime.byDriveTime)
router.post(
  "/geojson",
  multer({
    dest: "./tmp",
    // filename(req, file, cb) {
    //   cb(null, `${cuid()}-${file.filename}`)
    // }
  }).single("geojson"),
  byGeoJson.byGeoJson
)

module.exports = router
