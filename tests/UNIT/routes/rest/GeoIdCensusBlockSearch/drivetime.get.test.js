const test = require("ava")
const sinon = require("sinon")
const fetchMock = require("fetch-mock")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { driveTime: get } = require("../../../../../routes/rest/GeoIdCensusBlockSearch/index")
const driveTime = require("../../../../../models/regions/index")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  process.env.MAPBOX_DRIVETIME_URL = "https://api.mapbox.com/isochrone/v1/mapbox/"
  process.env.MAPBOX_ACCESS_TOKEN = "my-token"
  // eslint-disable-next-line no-param-reassign
  t.context.query = {
    long: 88.30601613954104,
    lat: 22.58074787234567,
    minutes: 50,
  }
  // eslint-disable-next-line no-param-reassign
  t.context.invalidquery = {
  }
})

test.afterEach(async () => {
  delete process.env.MAPBOX_BASE_URL
  delete process.env.MAPBOX_ACCESS_TOKEN
  fetchMock.restore()
})

test.serial("drivetime.get: Verify response after entering valid data in longitude,latitude,profile and minutes", async (t) => {
  fetchMock.get("https://api.mapbox.com/isochrone/v1/mapbox/driving/88.30601613954104,22.58074787234567?contours_minutes=50&polygons=true&access_token=my-token", {
    status: 200,
    features: [{
      properties: {
        fill: "#bf4040",
        fillOpacity: 0.33,
        "fill-opacity": 0.33,
        fillColor: "#bf4040",
        color: "#bf4040",
        contour: 50,
        opacity: 0.33,
        metric: "time"
      },
      geometry: {
        coordinates: [
          [
            [
              88.30461524676628,
              22.58003743390738
            ],
            [
              88.30462882544913,
              22.58002319344648
            ],
            [
              88.30464290704703,
              22.5800312424023
            ],
            [
              88.30463100474412,
              22.58004780467617
            ],
            [
              88.30461524676628,
              22.58003743390738
            ]
          ]
        ],
        type: "Polygon"
      },
      type: "Feature"
    }]
  })

  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("drivetime.get: Verify response after entering valid data in longitude,latitude,profile and minutes without mocking the output", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering invalid query", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.invalidquery
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering string value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, long: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering array value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, long: [-84.091998, -84.091999] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering undefined value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, long: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering null value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, long: null }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering boolean value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, long: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering string value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, lat: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering array value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, lat: [30.455749, 30.455749] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering undefined value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, lat: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering null value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, lat: null }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering boolean value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, lat: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering string value in minutes ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, minutes: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering invalid value in minutes ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, minutes: 61 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering negative value in minutes ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, minutes: -1 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering array value in minutes ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, minutes: [50, 50] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering undefined value in minutes ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, minutes: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering null value in minutes ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, minutes: null }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("drivetime.get: Verify response after entering boolean value in minutes ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, minutes: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(driveTime, "find").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
