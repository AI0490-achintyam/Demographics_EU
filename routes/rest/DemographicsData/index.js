const express = require("express")
const multer = require("multer")

/** The Controller files */
const byGeoId = require("./byGeoId")
const byRadius = require("./byRadius")
const byDriveTime = require("./byDriveTime")
const byGeoJson = require("./byGeoJson")

const router = express.Router()

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
