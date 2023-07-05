const express = require("express")
const router = express.Router()

const { expressjwt } = require("express-jwt")

const checkJwt = expressjwt({ secret: process.env.SECRET, algorithms: ["HS256"] }) // the JWT auth check middleware

const login = require("./auth/index")
const signup = require("./auth/signup")
// const forgotpassword = require("./auth/password")
// const users = require("./users")

const SearchIdentifiers = require("./SearchIdentifiers")
const AddressTranslation = require("./AddressTranslation")
const GeoIdCensusBlockSearch = require("./GeoIdCensusBlockSearch")
const ReverseLookups = require("./ReverseLookups")
const DemographicsData = require("./DemographicsData")

// const region = require("./region")
// const census = require("./census")
const references = require("./references")

router.post("/signup", signup.post) // UNAUTHENTICATED
router.post("/login", login.post) // UNAUTHENTICATED

router.all("*", checkJwt) // use this auth middleware for ALL subsequent routes

// router.post("/forgotpassword", forgotpassword.startWorkflow) // UNAUTHENTICATED; AJAX
// router.post("/resetpassword", forgotpassword.resetPassword) // UNAUTHENTICATED; AJAX

// router.get("/users", users.find)
// router.get("/user/:id", users.get)
// router.post("/user", users.post)
// router.put("/user/:id", users.put)
// router.delete("/user/:id", users.delete)

// Search Identifiers routes .................
router.get("/searchIdentifiers/byname", SearchIdentifiers.searchByName)
router.get("/searchIdentifiers/byzipcode", SearchIdentifiers.searchByZipcode)

// Address translator routes...............
router.get("/geocoding", AddressTranslation.getCoordinates)

// Search list of GeoIdCensusBlockSearch routes ...................
router.get("/search/radius", GeoIdCensusBlockSearch.radiusSearch)
router.get("/search/drivetime", GeoIdCensusBlockSearch.driveTime)
router.get("/search/msa/:geoId", GeoIdCensusBlockSearch.msa)
router.get("/search/zipcode/:geoId", GeoIdCensusBlockSearch.zipcode)
// router.get("/regions", GeoIdCensusBlockSearch.regions)
// router.get("/search/point", GeoIdCensusBlockSearch.point)

// Reverse Lookups routes ...............
router.get("/reverseLookup/point", ReverseLookups.searchByLongLat)
router.get("/reverseLookup/geoid/:geoId", ReverseLookups.searchByGeoId)

// Search particular regions data.................
// router.get("/region/:id", region.get)

// Search particular census data.................
// router.get("/census/:geoid", census.get)

// DemographicsData routes................
router.use("/demographicsData", DemographicsData)

// Search list of  references.................
router.get("/references/categories", references.categories)
router.get("/references/attributes", references.attributes)
// router.get("/references/msa", references.msa)
// router.get("/references/forecastyears", references.forecastYears)

module.exports = router
