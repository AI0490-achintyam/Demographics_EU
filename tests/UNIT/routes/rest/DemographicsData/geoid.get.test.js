const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { byGeoId: get } = require("../../../../../routes/rest/DemographicsData/index")
const GeoId = require("../../../../../models/census")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.validGeoId = "60650408211"
  // eslint-disable-next-line no-param-reassign
  t.context.invalidGeoId = "60652323"
})

test.serial("GeoId.get: Verify response after entering valid GeoId", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.validGeoId,
    }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("GeoId.get: Verify response after entering invalid GeoId", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.invalidGeoId
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("GeoId.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(GeoId, "findOne").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.validGeoId,
    }
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
