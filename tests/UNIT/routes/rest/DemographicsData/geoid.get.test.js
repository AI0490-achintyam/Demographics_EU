const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { byGeoId: get } = require("../../../../../routes/rest/DemographicsData/byGeoId")
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
  t.context.invalidGeoId = "6065022"
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

test.serial("GeoId.get: Verify response after entering valid GeoId with invalid censusCategory", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.validGeoId,
    },
    body: {
      censusCategory: "xyz"
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("GeoId.get: Verify response after entering valid GeoId with undefined censusCategory", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.validGeoId,
    },
    body: {
      censusCategory: undefined
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("GeoId.get: Verify response after entering valid GeoId with null censusCategory", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.validGeoId,
    },
    body: {
      censusCategory: null
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("GeoId.get: Verify response after entering valid GeoId with integer value in censusCategory", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.validGeoId,
    },
    body: {
      censusCategory: 1
    }
  })
  t.is(status, 400)
  t.true(body.error)
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

test.serial("GeoId.get: Verify response after entering integer value in censusAttributes ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.valid
    },
    body: {
      censusAttributes: 1
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("GeoId.get: Verify response after entering undefined value in censusAttributes ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.valid
    },
    body: {
      censusAttributes: undefined
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("GeoId.get: Verify response after entering invalid geoid", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.invalidGeoId,
    },
    body: {
      censusCategory: "Race"
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
    },
    body: {
      censusCategory: "Race"
    }
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
