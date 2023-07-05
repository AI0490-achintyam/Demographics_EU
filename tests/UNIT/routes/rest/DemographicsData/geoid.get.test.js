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
})

test.serial("GeoId.get: Verify response after entering valid GeoId with proper censusCategory", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.validGeoId,
    },
    body: {
      censusCategory: "Race"
    }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("GeoId.get: Verify response after entering valid GeoId with proper censusAttribute", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.validGeoId,
    },
    body: {
      censusAttributes: ["B01003_E001"]
    }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("GeoId.get: Verify response after entering no census data in the body", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.valid
    },
    body: {
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("GeoId.get: Verify response after entering blank array in censusAttributes ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.valid
    },
    body: {
      censusAttributes: []
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("GeoId.get: Verify response after getting null value", async (t) => {
  const stub = sinon.stub(GeoId, "find").returns({
    select: sinon.stub().returnsThis(),
    lean: sinon.stub().returnsThis(),
    exec: sinon.stub().resolves(null)
  })
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.validGeoId,
    },
    body: {
      censusCategory: "Race"
    }
  })
  t.is(status, 400)
  t.true(body.error)
  stub.restore()
})

test.serial("GeoId.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(GeoId, "find").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.validGeoId,
    },
    body: {
      censusCategory: "Race"
    }
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
