const test = require("ava")
const sinon = require("sinon")
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

test.beforeEach(async () => {
  process.env.MAPBOX_BASE_URL = "https://api.mapbox.com/isochrone/v1/mapbox/"
})

test.afterEach(async () => {
  delete process.env.MAPBOX_BASE_URL
})

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.query = {
    long: 88.30601613954104,
    lat: 22.58074787234567,
    profile: "cycling",
    minutes: 50,
  }
  // eslint-disable-next-line no-param-reassign
  t.context.invalidquery = {
  }
})

test.skip("drivetime.get: Verify response after entering valid data in longitude,latitude,profile and minutes", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 200)
  t.false(body.error)
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

test.serial("drivetime.get: Verify response after entering integer value in profile ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, profile: 1 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering invalid value in profile ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, profile: "xyz" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering array value in profile ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, profile: ["cycling"] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering undefined value in profile ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, profile: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering null value in profile ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, profile: null }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering boolean value in profile ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, profile: true }
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
